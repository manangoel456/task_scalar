import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

const Card = ({ card, index, onClick }) => {
  return (
    <Draggable draggableId={card._id} index={index}>
      {(provided) => (
        <div
          className="card"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(card)}
        >
          <div className="card-labels">
            {card.labels.map((label, i) => (
              <span key={i} className="card-label" style={{ backgroundColor: label.color }}>{label.text}</span>
            ))}
          </div>
          <p>{card.title}</p>
          <div className="card-footer">
            {card.dueDate && (
              <span className="card-due-date">
                Due {new Date(card.dueDate).toLocaleDateString()}
              </span>
            )}
            <div className="card-assignees">
              {card.assignees.map(assignee => (
                <div key={assignee._id} className="assignee-avatar" title={assignee.name}>
                  {assignee.avatar ? <img src={assignee.avatar} alt={assignee.name} /> : assignee.name.charAt(0)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default Card;