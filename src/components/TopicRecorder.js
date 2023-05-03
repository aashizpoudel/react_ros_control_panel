// TopicRecorder react function component

import { Dropdown } from "@nextui-org/react";

import { useEffect, useState } from 'react';

function ListSelector({ options }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleItemClick = (item) => {
        setSelectedItems([...selectedItems, item]);
    };

    const handleClearSelection = () => {
        setSelectedItems([]);
    };

    const filteredOptions = options.filter((option) =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <label htmlFor="searchInput">Search:</label>
            <input
                type="text"
                id="searchInput"
                value={searchTerm}
                onChange={handleSearchChange}
            />
            <Dropdown>
                <Dropdown.Button flat color="secondary" css={{ tt: "capitalize" }}>
                    {selectedItems}
                </Dropdown.Button>
                <Dropdown.Menu
                    aria-label="Multiple selection actions"
                    color="secondary"
                    disallowEmptySelection
                    selectionMode="multiple"
                    selectedKeys={selectedItems}
                    onSelectionChange={handleItemClick}
                >
                    {filteredOptions.map((option) => (<Dropdown.Item key={option}>{option}</Dropdown.Item>))}

                </Dropdown.Menu>
            </Dropdown>




        </div>
    );
}



function TopicRecorder({ ros }) {

    const [topics, setTopics] = useState([]);
    useEffect(() => {
        if (ros !== null) {
            ros.getTopics(({ topics }) => {
                console.log(topics);
                setTopics(topics);
            }, (e) => {
                console.log(e)
            });
        }
    });
    return (
        <div>
            <ListSelector options={topics} />
        </div>
    );

}
export default TopicRecorder;