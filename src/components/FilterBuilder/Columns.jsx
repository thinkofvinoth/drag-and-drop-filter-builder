import React from 'react';
import { useDrag } from 'react-dnd';
import { Calendar, List, Grip } from 'lucide-react';



export const Column = ({ column }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'COLUMN',
    item: { id: column.id, name: column.name, type: column.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'datetime':
        return <Calendar className="w-4 h-4" />;
      case 'number':
        return <List className="w-4 h-4" />;
      default:
        return <Grip className="w-4 h-4" />;
    }
  }