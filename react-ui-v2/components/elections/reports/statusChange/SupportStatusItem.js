import React from 'react';

const SupportStatusItem = ({item, itemSelected, supportStatusChange}) => {
    return (
        <label className="margin-right20">
            <input type="checkbox" checked={itemSelected} onChange={supportStatusChange.bind(this, item.key, item.id)}/>{item.name}
        </label>
    );
};

export default SupportStatusItem;