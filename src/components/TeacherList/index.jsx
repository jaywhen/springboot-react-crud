import React, { useEffect, useState } from 'react'
import { Table, Button, Avatar, Popconfirm, Modal, Input } from "antd";
import axios from "axios";
import "./teacher-list.css";
import TeacherForm from '../TeacherForm';

const Search = Input.Search;

export default function TeacherList() {
    // utils
    const delFromArrayByItemElm = (arr, id) => {
        for(let i = 0; i < arr.length; i++) {
            if(arr[i].id === id) return i;
        }
    }

    /**
     * 
     * @param {Array} arr 待更新的数组
     * @param {Object} item arr 数组中需要更新的项
     * @returns {Array} newArr 一个新的已被更新的数组
     */ 
    const updArrayByItem = (arr, item) => {
        // for(let i = 0; i < arr.length; i++) {
        //     if(arr[i].id == item.id) {
        //         console.log("修改了");
        //         arr[i] = item;
        //     }
        // }
        // 使用高阶函数而非 for 来做 "不可变"
        let newArr = arr.map((arrItem) => {
            if(arrItem.id == item.id) { return item; }
            else { return arrItem; }
        })
        return newArr;
    }

    // define dataSource && some states
    const [dataSource, setDataSource] = useState([]);
    const [updVal, setUpdVal] = useState([]);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isUpdModalVisible, setIsUpdModalVisible] = useState(false);
    const [searchText, setSearchText] = useState("");

    // index data
    useEffect(() => {
        axios.get('http://localhost:8080/teacher/findAll')
             .then((rsp) => {
                 setDataSource(rsp.data);
             })
             .catch((error) => {
                 console.log(error)
             })
    }, [])


    // CRUD -> D
    const handleDelete = (index) => {
        axios.delete('http://localhost:8080/teacher/deleteById/' + index.id)
             .then((rsp) => {
                 let tmpData = [...dataSource];
                 let i = delFromArrayByItemElm(tmpData ,index.id);
                 tmpData.splice(i, 1);
                 console.log(tmpData)
                 setDataSource(tmpData)
             })
             .catch((error) => {
                 console.log(error)
             }) 
    }

    // CRUD -> C
    const handleAdd = (value) => {
        axios.post('http://localhost:8080/teacher/save/', value)
             .then((rsp) => {
                let tmpData = [...dataSource];
                tmpData.push(rsp.data);
                setDataSource(tmpData);
             })
             .catch((error) => {
                console.log(error)
             })
    }

    // CRUD -> U
    const handleUpd = (value) => {
        axios.put('http://localhost:8080/teacher/update/', value)
             .then((rsp) => {
                 // 替换原来 dataSource 中的item
                 let tmpData = updArrayByItem([...dataSource], value);
                 console.log(tmpData)
                 setDataSource(tmpData);
             })
             .catch((error) => {
                 console.log(error)
             })
    }

    const onUpdClick = (index) => {
        // 处理特殊数据
        index.department = [index.department]
        setIsUpdModalVisible(true)
        setUpdVal(index)
    }

    // CRUD -> D
    const onSearch = e => {

        setSearchText(e.target.value)
    }

    // table header
    const columns = [
        {
            title: 'Avatar',
            dataIndex: 'avatar',
            key: 'avatar',
            render: (_,index) => {
                return(<Avatar src={ index.avatar } />) 
            }
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Gender',
            dataIndex: 'gender',
            key: 'gender',
        },
        {
            title: 'Department',
            dataIndex: 'department',
            key: 'department',
        },
        {
            title: 'Tel',
            dataIndex: 'tel',
            key: 'tel',
        },
        {
            title: 'Operation',
            dataIndex: 'operation',
            key: 'operation',
            render: (_,index) => 
                dataSource.length >= 1 ? (
                    <div className="del-update-container">
                        <Button size="small" type="primary" onClick={() => onUpdClick(index)}>Update</Button>
                        <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(index)}>
                            <Button style={{ marginLeft: 5 }} size="small" danger type="primary">Delete</Button>
                        </Popconfirm>
                    </div>
                ) : null
        }
    ]

    const onAddSubmit = () => {
        setIsAddModalVisible(false)
    }

    const onUpdSubmit = () => {
        setIsUpdModalVisible(false)
    }

    return (
        <div className="teacher-list">
            <div className="add-search-container">
                <Button
                    type="primary"
                    onClick={() => setIsAddModalVisible(true)}
                    >
                    Add a row
                </Button>
                <Search 
                    style={{ marginLeft: 30 }} 
                    placeholder="input search text" 
                    onChange={onSearch}
                    onPressEnter={onSearch}
                    enterButton
                    value={searchText}
                     />
            </div>
            
            <Modal 
                destroyOnClose={true}
                width={350} 
                title="Add a teacher" 
                visible={isAddModalVisible} 
                footer={[]}
                onCancel={() => setIsAddModalVisible(false)}
            >
                <TeacherForm handleAdd={handleAdd} onAddSubmit={onAddSubmit} />
            </Modal>

            <Modal 
                destroyOnClose={true}
                width={350} 
                title="Update a teacher" 
                visible={isUpdModalVisible} 
                footer={[]}
                onCancel={() => setIsUpdModalVisible(false)}
            >
                <TeacherForm handleUpd={handleUpd} values={updVal} onUpdSubmit={onUpdSubmit} />
            </Modal>

            <Table
                columns={columns}
                rowKey={(record) => {
                    return record.id
                }}
                dataSource={dataSource}
            />
        </div>
    )
}
