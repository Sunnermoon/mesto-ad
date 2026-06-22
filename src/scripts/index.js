import '../pages/index.css';
import { 
  getUserInfo, 
  getInitialCards, 
  updateUserInfo, 
  addNewCard, 
  deleteCardFromServer, 
  addLike, 
  removeLike, 
  updateAvatar 
} from './components/api.js';
import { createCardElement, handleLike } from './components/card.js';
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from './components/modal.js';
import { enableValidation, clearValidation } from './components/validation.js';

// Конфигурация валидации
const validationSettings = {
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__button',
  inactiveButtonClass: 'popup__button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__error_visible'
};

// DOM Элементы
const cardList = document.querySelector('.places__list');
const profileName = document.querySelector('.profile__title');
const profileAbout = document.querySelector('.profile__description');
const profileImage = document.querySelector('.profile__image');

// Попапы
const popupEditProfile = document.querySelector('.popup_type_edit');
const popupAddCard = document.querySelector('.popup_type_new-card');
const popupEditAvatar = document.querySelector('.popup_type_edit-avatar');
const popupConfirmDelete = document.querySelector('.popup_type_remove-card');
const popupImagePreview = document.querySelector('.popup_type_image');
const popupCardInfo = document.querySelector('.popup_type_info');

// Формы и инпуты
const formEditProfile = popupEditProfile.querySelector('.popup__form');
const inputName = formEditProfile.querySelector('.popup__input_type_name');
const inputAbout = formEditProfile.querySelector('.popup__input_type_description');

const formAddCard = popupAddCard.querySelector('.popup__form');
const inputCardName = formAddCard.querySelector('.popup__input_type_card-name');
const inputCardLink = formAddCard.querySelector('.popup__input_type_url');

const formEditAvatar = popupEditAvatar.querySelector('.popup__form');
const inputAvatarUrl = formEditAvatar.querySelector('.popup__input_type_avatar');

const formConfirmDelete = popupConfirmDelete.querySelector('.popup__form');

// Глобальные переменные
let currentUserId;
let cardForDeletion = null;
let cardIdForDeletion = null;

// Функции-хелперы

// Улучшение UX: индикация загрузки
const setButtonState = (isLoading, button, text = "Сохранить", loadingText = "Сохранение...") => {
  button.textContent = isLoading ? loadingText : text;
};

// Открытие превью изображения
const onImagePreview = (name, link) => {
  const imageElement = popupImagePreview.querySelector('.popup__image');
  const captionElement = popupImagePreview.querySelector('.popup__caption');
  imageElement.src = link;
  imageElement.alt = name;
  captionElement.textContent = name;
  openModalWindow(popupImagePreview);
};

// Открытие попапа с информацией о карточке
const onCardInfo = (cardData) => {
  const ownerElement = popupCardInfo.querySelector('.popup__info-description_type_owner');
  const dateElement = popupCardInfo.querySelector('.popup__info-description_type_date');
  const likesList = popupCardInfo.querySelector('.popup__list_type_likes');

  ownerElement.textContent = cardData.owner.name;
  
  const date = new Date(cardData.createdAt);
  dateElement.textContent = date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  likesList.innerHTML = '';
  if (cardData.likes.length > 0) {
    cardData.likes.forEach(user => {
      const li = document.createElement('li');
      li.classList.add('popup__list-item', 'popup__list-item_type_badge');
      li.textContent = user.name;
      likesList.append(li);
    });
  } else {
    likesList.textContent = 'Лайков пока нет';
  }

  openModalWindow(popupCardInfo);
};

// Обработка клика по удалению (открытие попапа подтверждения)
const onCardDeleteClick = (cardId, cardElement) => {
  cardIdForDeletion = cardId;
  cardForDeletion = cardElement;
  openModalWindow(popupConfirmDelete);
};

// Обработчики форм

// Сабмит редактирования профиля
const submitProfileForm = (evt) => {
  evt.preventDefault();
  const btn = formEditProfile.querySelector('.popup__button');
  setButtonState(true, btn);
  updateUserInfo(inputName.value, inputAbout.value)
    .then((data) => {
      profileName.textContent = data.name;
      profileAbout.textContent = data.about;
      closeModalWindow(popupEditProfile);
    })
    .catch(err => console.error(`Ошибка при обновлении профиля: ${err}`))
    .finally(() => setButtonState(false, btn));
};

// Сабмит добавления карточки
const submitAddCardForm = (evt) => {
  evt.preventDefault();
  const btn = formAddCard.querySelector('.popup__button');
  setButtonState(true, btn, "Создать", "Создание...");
  addNewCard(inputCardName.value, inputCardLink.value)
    .then((cardData) => {
      const card = createCardElement(cardData, currentUserId, {
        onDelete: onCardDeleteClick,
        onLike: (id, btn, count) => handleLike(id, btn, count, addLike, removeLike),
        onImageClick: onImagePreview,
        onInfoClick: onCardInfo
      });
      cardList.prepend(card);
      closeModalWindow(popupAddCard);
      formAddCard.reset();
    })
    .catch(err => console.error(`Ошибка при добавлении карточки: ${err}`))
    .finally(() => setButtonState(false, btn, "Создать"));
};

// Сабмит обновления аватара
const submitAvatarForm = (evt) => {
  evt.preventDefault();
  const btn = formEditAvatar.querySelector('.popup__button');
  setButtonState(true, btn);
  updateAvatar(inputAvatarUrl.value)
    .then((data) => {
      profileImage.style.backgroundImage = `url(${data.avatar})`;
      closeModalWindow(popupEditAvatar);
      formEditAvatar.reset();
    })
    .catch(err => console.error(`Ошибка при обновлении аватара: ${err}`))
    .finally(() => setButtonState(false, btn));
};

// Сабмит подтверждения удаления
const submitConfirmDelete = (evt) => {
  evt.preventDefault();
  const btn = formConfirmDelete.querySelector('.popup__button');
  setButtonState(true, btn, "Да", "Удаление...");
  deleteCardFromServer(cardIdForDeletion)
    .then(() => {
      cardForDeletion.remove();
      closeModalWindow(popupConfirmDelete);
    })
    .catch(err => console.error(`Ошибка при удалении карточки: ${err}`))
    .finally(() => setButtonState(false, btn, "Да"));
};

// Слушатели

// Открытие попапа профиля
document.querySelector('.profile__edit-button').addEventListener('click', () => {
  inputName.value = profileName.textContent;
  inputAbout.value = profileAbout.textContent;
  clearValidation(formEditProfile, validationSettings);
  
  // Согласно замечанию ревьюера, кнопка должна быть отключена при открытии
  const submitButton = formEditProfile.querySelector(validationSettings.submitButtonSelector);
  submitButton.disabled = true;
  submitButton.classList.add(validationSettings.inactiveButtonClass);
  
  openModalWindow(popupEditProfile);
});

// Открытие попапа новой карточки
document.querySelector('.profile__add-button').addEventListener('click', () => {
  formAddCard.reset();
  clearValidation(formAddCard, validationSettings);
  openModalWindow(popupAddCard);
});

// Открытие попапа аватара
profileImage.addEventListener('click', () => {
  formEditAvatar.reset();
  clearValidation(formEditAvatar, validationSettings);
  openModalWindow(popupEditAvatar);
});

// Навешивание сабмитов
formEditProfile.addEventListener('submit', submitProfileForm);
formAddCard.addEventListener('submit', submitAddCardForm);
formEditAvatar.addEventListener('submit', submitAvatarForm);
formConfirmDelete.addEventListener('submit', submitConfirmDelete);

// Закрытие попапов по клику на крестик и оверлей
document.querySelectorAll('.popup').forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

// Инцииализация

// Загрузка данных с сервера
Promise.all([getUserInfo(), getInitialCards()])
  .then(([userData, cards]) => {
    currentUserId = userData._id;
    profileName.textContent = userData.name;
    profileAbout.textContent = userData.about;
    profileImage.style.backgroundImage = `url(${userData.avatar})`;

    cards.forEach((cardData) => {
      const card = createCardElement(cardData, currentUserId, {
        onDelete: onCardDeleteClick,
        onLike: (id, btn, count) => handleLike(id, btn, count, addLike, removeLike),
        onImageClick: onImagePreview,
        onInfoClick: onCardInfo
      });
      cardList.append(card);
    });
  })
  .catch(err => console.error(`Ошибка инициализации данных: ${err}`));

// Включение валидации
enableValidation(validationSettings);
