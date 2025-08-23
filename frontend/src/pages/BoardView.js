import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext } from 'react-beautiful-dnd';
import { useBoard } from '../context/BoardContext';
import api from '../api';
import List from '../components/board/List';
import CardDetailsModal from '../components/board/CardDetailsModal';
import ShareBoardModal from '../components/board/ShareBoardModal';

const BoardView = () => {
    const { boardId } = useParams();
    const { board, lists, cards, loading, dispatch, moveCard } = useBoard();
    
    const [isCreatingList, setIsCreatingList] = useState(false);
    const [newListTitle, setNewListTitle] = useState('');
    
    const [isCardModalOpen, setCardModalOpen] = useState(false);
    const [isShareModalOpen, setShareModalOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);

    const fetchBoardData = async () => {
        dispatch({ type: 'LOAD_BOARD_START' });
        try {
            const [boardRes, listsRes, membersRes] = await Promise.all([
                api.get(`/boards/${boardId}`),
                api.get(`/lists/board/${boardId}`),
                api.get(`/boards/${boardId}/members`),
            ]);

            const cardsByList = {};
            for (const list of listsRes.data) {
                const cardsRes = await api.get(`/cards/list/${list._id}`);
                cardsByList[list._id] = cardsRes.data;
            }
            
            dispatch({
                type: 'LOAD_BOARD_SUCCESS',
                payload: { board: boardRes.data, lists: listsRes.data, cards: cardsByList, members: membersRes.data, activities: [] },
            });
        } catch (err) {
            console.error("Error fetching board data:", err);
            dispatch({ type: 'LOAD_BOARD_FAIL', payload: err.message });
        }
    };

    useEffect(() => { fetchBoardData(); }, [boardId, dispatch]);

    useEffect(() => {
        const ws = new WebSocket(`ws://${window.location.host.split(':')[0]}:5000`);
        ws.onopen = () => ws.send(JSON.stringify({ type: 'JOIN_BOARD', payload: { boardId } }));
        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (['CARD_DELETED', 'LIST_CREATED', 'CARD_CREATED'].includes(message.type)) {
                fetchBoardData();
            } else {
                dispatch({ type: `REALTIME_${message.type}`, payload: message.payload });
            }
        };
        return () => ws.close();
    }, [boardId, dispatch]);

    const handleCreateList = async (e) => {
        e.preventDefault();
        if (!newListTitle.trim()) return;
        const newPosition = (lists.length > 0) ? (Math.max(...lists.map(l => l.position)) + 65536) : 65536;
        try {
            await api.post('/lists', { title: newListTitle, boardId, position: newPosition });
            fetchBoardData();
        } catch (err) { console.error("Failed to create list", err); }
        finally {
            setIsCreatingList(false);
            setNewListTitle('');
        }
    };
    
    const handleCardClick = (card) => {
        setSelectedCard(card);
        setCardModalOpen(true);
    };

    const handleModalClose = () => {
        setCardModalOpen(false);
        setSelectedCard(null);
    };

    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;
        
        const startListId = source.droppableId;
        const finishListId = destination.droppableId;
        const newCardsState = { ...cards };
        const startListCards = Array.from(newCardsState[startListId]);
        const [movedCard] = startListCards.splice(source.index, 1);
        
        if (startListId === finishListId) {
            startListCards.splice(destination.index, 0, movedCard);
            newCardsState[startListId] = startListCards;
        } else {
            const finishListCards = Array.from(newCardsState[finishListId] || []);
            finishListCards.splice(destination.index, 0, movedCard);
            newCardsState[startListId] = startListCards;
            newCardsState[finishListId] = finishListCards;
        }
        
        moveCard(newCardsState);

        const finishCards = newCardsState[finishListId];
        const prevCard = finishCards[destination.index - 1];
        const nextCard = finishCards[destination.index + 1];
        let newPosition;
        if (!prevCard && !nextCard) newPosition = 65536;
        else if (!prevCard) newPosition = nextCard.position / 2;
        else if (!nextCard) newPosition = prevCard.position + 65536;
        else newPosition = (prevCard.position + nextCard.position) / 2;
        
        try {
            await api.put(`/cards/${draggableId}/move`, { newListId: finishListId, newPosition });
        } catch (err) {
            console.error('Failed to move card:', err);
        }
    };
    
    if (loading) return <div className="board-view"><h1>Loading board...</h1></div>;

    return (
        <>
            <div className="board-view">
                <div className="board-header">
                    <h1>{board ? board.title : 'Board'}</h1>
                    <button onClick={() => setShareModalOpen(true)} className="share-btn">Share 🤝</button>
                </div>
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="lists-container">
                        {lists.sort((a, b) => a.position - b.position).map((list) => (
                            <List 
                                key={list._id} 
                                list={list} 
                                cards={cards[list._id] || []}
                                onCardClick={handleCardClick}
                                onDataRefresh={fetchBoardData}
                            />
                        ))}
                        <div className="add-list-container">
                            {!isCreatingList ? (
                                <button className="add-list-button" onClick={() => setIsCreatingList(true)}>+ Add another list</button>
                            ) : (
                                <form onSubmit={handleCreateList} className="add-list-form">
                                    <input type="text" value={newListTitle} onChange={(e) => setNewListTitle(e.target.value)} placeholder="Enter list title..." autoFocus />
                                    <div className="form-actions">
                                        <button type="submit">Add List</button>
                                        <button type="button" onClick={() => setIsCreatingList(false)}>✕</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </DragDropContext>
            </div>
            {isCardModalOpen && selectedCard && (
                <CardDetailsModal 
                    card={selectedCard}
                    onClose={handleModalClose}
                    onDataRefresh={fetchBoardData}
                />
            )}
            {isShareModalOpen && board && (
                <ShareBoardModal
                    board={board}
                    onClose={() => setShareModalOpen(false)}
                />
            )}
        </>
    );
};

export default BoardView;