import React, { useState } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import Card from './Card';
import api from '../../api';

const List = ({ list, cards, onCardClick, onDataRefresh }) => {
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [newCardTitle, setNewCardTitle] = useState('');

    const handleAddCard = async (e) => {
        // This can be triggered by form submit or by the Enter key
        if (e) e.preventDefault();
        if (!newCardTitle.trim()) {
            setIsAddingCard(false); // Close if empty
            return;
        };

        const newPosition = (cards.length > 0) ? (Math.max(...cards.map(c => c.position)) + 65536) : 65536;

        try {
            await api.post('/cards', {
                title: newCardTitle,
                listId: list._id,
                boardId: list.board,
                position: newPosition,
            });
            onDataRefresh();
        } catch (err) {
            console.error("Failed to create card", err);
        } finally {
            setIsAddingCard(false);
            setNewCardTitle('');
        }
    };

    // NEW: Function to handle key presses in the textarea
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent adding a new line
            handleAddCard();    // Submit the card
        }
    };

    return (
        <div className="list">
            <h3>{list.title}</h3>
            <Droppable droppableId={list._id} type="card">
                {(provided) => (
                    <div className="card-list" ref={provided.innerRef} {...provided.droppableProps}>
                        {cards.sort((a, b) => a.position - b.position).map((card, index) => (
                            <Card key={card._id} card={card} index={index} onClick={onCardClick} />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
            <div className="add-card-container">
                {!isAddingCard ? (
                    <button className="add-card-button" onClick={() => setIsAddingCard(true)}>
                        + Add a card
                    </button>
                ) : (
                    <form onSubmit={handleAddCard} className="add-card-form">
                        <textarea
                            value={newCardTitle}
                            onChange={(e) => setNewCardTitle(e.target.value)}
                            onKeyDown={handleKeyDown} // NEW: Added keyboard listener
                            placeholder="Enter a title for this card..."
                            autoFocus
                        />
                        <div className="form-actions">
                            <button type="submit">Add card</button>
                            <button type="button" onClick={() => setIsAddingCard(false)}>✕</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default List;