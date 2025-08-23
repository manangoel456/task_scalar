import React, { createContext, useReducer, useContext } from 'react';

const BoardContext = createContext();

const boardReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_BOARD_START':
      return { ...state, loading: true };
    case 'LOAD_BOARD_SUCCESS':
      return {
        ...state,
        board: action.payload.board,
        lists: action.payload.lists,
        cards: action.payload.cards,
        members: action.payload.members,
        activities: action.payload.activities,
        loading: false,
      };
    case 'LOAD_BOARD_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'CARD_MOVE':
      return { ...state, cards: action.payload };
    case 'REALTIME_CARD_MOVE': {
        const { cardId, oldListId, newListId, newPosition } = action.payload;
        const newCards = { ...state.cards };
        if (newCards[oldListId]) {
            newCards[oldListId] = newCards[oldListId].filter(c => c._id !== cardId);
        }
        let movedCard;
        Object.values(state.cards).forEach(cardList => {
            const foundCard = cardList.find(c => c._id === cardId);
            if(foundCard) movedCard = foundCard;
        });

        if (movedCard) {
            movedCard.list = newListId;
            movedCard.position = newPosition;
            if (!newCards[newListId]) newCards[newListId] = [];
            newCards[newListId].push(movedCard);
            newCards[newListId].sort((a, b) => a.position - b.position);
        }

        return { ...state, cards: newCards };
    }
    case 'REALTIME_CARD_CREATED': {
        const newCard = action.payload;
        const listId = newCard.list;
        const newCards = { ...state.cards };
        if (!newCards[listId]) newCards[listId] = [];
        newCards[listId] = [...newCards[listId], newCard].sort((a,b) => a.position - b.position);
        return { ...state, cards: newCards };
    }
    case 'REALTIME_CARD_UPDATED': {
        const updatedCard = action.payload;
        const listId = updatedCard.list;
        const newCards = { ...state.cards };

        if (newCards[listId]) {
            const cardIndex = newCards[listId].findIndex(c => c._id === updatedCard._id);
            if (cardIndex > -1) {
                newCards[listId][cardIndex] = updatedCard;
            }
        }
        return { ...state, cards: newCards };
    }
    case 'REALTIME_MEMBER_ADDED': {
        return { ...state, members: [...state.members, action.payload] };
    }
    case 'REALTIME_ACTIVITY_CREATED': {
        return { ...state, activities: [action.payload, ...state.activities] };
    }
    default:
      return state;
  }
};

export const BoardProvider = ({ children }) => {
  const initialState = {
    board: null,
    lists: [],
    cards: {},
    members: [],
    activities: [],
    loading: true,
    error: null,
  };

  const [state, dispatch] = useReducer(boardReducer, initialState);

  const moveCard = (newCardsState) => {
    dispatch({ type: 'CARD_MOVE', payload: newCardsState });
  };
  
  return (
    <BoardContext.Provider value={{ ...state, dispatch, moveCard }}>
      {children}
    </BoardContext.Provider>
  );
};

export const useBoard = () => useContext(BoardContext);