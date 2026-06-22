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
  // Исправлено: userId должен быть строкой, cardData.owner._id тоже.
  if (cardData.owner && cardData.owner._id !== userId) {
    deleteButton.remove();
  } else {
    deleteButton.addEventListener('click', () => onDelete(cardData._id, cardElement));
  }

  // Кнопка информации
  infoButton.addEventListener('click', () => onInfoClick(cardData));

  // Проверяем наличие нашего лайка
  const hasMyLike = cardData.likes ? cardData.likes.some(user => user._id === userId) : false;
  if (hasMyLike) {
    likeButton.classList.add('card__like-button_is-active');
  }

  // Лайк
  likeButton.addEventListener('click', () => onLike(cardData._id, likeButton, likeCountElement));
  
  // Клик по картинке
  cardImage.addEventListener('click', () => onImageClick(cardData.name, cardData.link));

  return cardElement;
};

/**
 * Обрабатывает логику лайка (запрос к API и обновление UI)
 */
export const handleLike = (cardId, likeButton, likeCountElement, addLikeApi, removeLikeApi) => {
  const isLiked = likeButton.classList.contains('card__like-button_is-active');
  const apiCall = isLiked ? removeLikeApi : addLikeApi;

  apiCall(cardId)
    .then((res) => {
      likeButton.classList.toggle('card__like-button_is-active');
      likeCountElement.textContent = res.likes.length;
    })
    .catch(err => console.error(`Ошибка при взаимодействии с лайком: ${err}`));
};
