// Работа с карточками

const cardTemplate = document.querySelector('#card-template').content;

/**
 * Создает DOM-элемент карточки
 */
export const createCardElement = (cardData, userId, { onDelete, onLike, onImageClick, onInfoClick }) => {
  const cardElement = cardTemplate.querySelector('.card').cloneNode(true);
  const cardImage = cardElement.querySelector('.card__image');
  const cardTitle = cardElement.querySelector('.card__title');
  const deleteButton = cardElement.querySelector('.card__control-button_type_delete');
  const infoButton = cardElement.querySelector('.card__control-button_type_info');
  const likeButton = cardElement.querySelector('.card__like-button');
  const likeCountElement = cardElement.querySelector('.card__like-count');

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;
  likeCountElement.textContent = cardData.likes ? cardData.likes.length : 0;

  // Если карточка не наша — удаляем кнопку удаления
  if (cardData.owner && cardData.owner._id !== userId) {
    deleteButton.remove();
  } else {
    deleteButton.addEventListener('click', () => onDelete(cardData._id, cardElement));
  }

  // Кнопка информации
  infoButton.addEventListener('click', () => onInfoClick(cardData._id));

  // Проверяем наличие нашего лайка
  const hasMyLike = cardData.likes ? cardData.likes.some(user => user._id === userId) : false;
  if (hasMyLike) {
    likeButton.classList.add('card__like-button_is-active');
  }

  // Лайк
  likeButton.addEventListener('click', () => {
    const isLiked = likeButton.classList.contains('card__like-button_is-active');
    onLike(cardData._id, likeButton, likeCountElement, isLiked);
  });
  
  // Клик по картинке
  cardImage.addEventListener('click', () => onImageClick(cardData.name, cardData.link));

  return cardElement;
};

/**
 * Обновляет визуальное состояние лайка
 */
export const updateLikeVisual = (likeButton, likeCountElement, likesCount) => {
  likeButton.classList.toggle('card__like-button_is-active');
  likeCountElement.textContent = likesCount;
};

/**
 * Удаляет элемент карточки из DOM
 */
export const removeCardElement = (cardElement) => {
  cardElement.remove();
};
