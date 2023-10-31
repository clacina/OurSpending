import './editable-list.component.styles.css';

import {useEffect, useRef, useState} from "react";

const Item = ({
                  text,
                  id,
                  deleteTodo,
                  updateText
              }) => {
    const [edit, setEdit] = useState(false);
    const [editText, setEditText] = useState(text);

    return (
        <div className="item">
            <div
                onDoubleClick={() => {
                    setEdit(true);
                }}
            >
                {edit ? (
                    <input
                        type="text"
                        value={editText}
                        onChange={(e) => {
                            setEditText(e.target.value);
                        }}
                        onBlur={() => {
                            setEdit(false);
                            updateText(id, editText);
                        }}
                    />
                ) : (
                    text
                )}
            </div>
            <div className="close" onClick={() => deleteTodo(id)}>
                X
            </div>
        </div>
    );
};


const EditableList = ({entity}) => {
    const [todos, setTodos] = useState([]);
    const inputRef = useRef();

    useEffect(() => {
        const ourNotes = entity.current.map((note) => {
            return ({"id": note.id, "text": note.note})
        })
        setTodos(ourNotes)
    }, [entity])

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            if(e.target.value.length) {
                console.log("Enter Key:, ", e.target.value);
                const newList = [...todos, {text: e.target.value, id: Date.now()}];
                setTodos(newList);
                entity.current = newList
                console.log('New list: ', entity.current);
                inputRef.current.value = "";
            }
        }
    };

    // delete item
    const handleDelete = (id) => {
        const filter = todos.filter((e) => e.id !== id);
        setTodos(filter);
        entity.current = filter;
    };

    // handle text update
    const handleUpdateText = (id, text) => {
        const updatedList = todos.map((e) => {
            if (e.id === id) {
                e.text = text;
            }

            return e;
        });

        setTodos(updatedList);
        entity.current = updatedList;
    };

    return (
        <div className="EdiableList">
            <input type="text" onKeyPress={handleKeyPress} ref={inputRef} />
            {todos.map((e) => (
                <Item
                    {...e}
                    key={e.id}
                    deleteTodo={handleDelete}
                    updateText={handleUpdateText}
                />
            ))}
        </div>
    );
}

export default EditableList;
