import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
// components
import {
  Box,
  Button,
  InputAdornment,
  MenuItem,
  TextField,
} from '@mui/material';
import {
  TreeItem as MuiTreeItem,
  TreeView as MuiTreeView,
} from '@mui/x-tree-view';
import FoldersToMove from './FoldersToMove';
// icons
import {
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  Folder as FolderIcon,
  InsertDriveFile as InsertDriveFileIcon,
  Pageview as PageviewIcon,
} from '@mui/icons-material';
// data
import response from '../assets/response.json';
// types
import { RenderTree, UserOperations, UserPermissions } from './types';


const permissions = [
  {
    value: 'read',
    label: 'Read',
  },
  {
    value: 'write',
    label: 'Write',
  },
  {
    value: 'readWrite',
    label: 'Read and Write',
  },
]

export default function TreeView() {
  const button = useRef<HTMLButtonElement>(null);
  const [treeData, setTreeData] = useState<RenderTree[]>(response as RenderTree[]);
  const [query, setQuery] = useState<string>('');
  const [filteredData, setFilteredData] = useState<RenderTree[]>(response as RenderTree[]);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('');
  const [userPermission, setUserPermission] = useState<UserPermissions>('read');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');

  useEffect(() => {
    if (query) {
      setFilteredData(filterNodes(treeData, query));
    }
  }, [query]);

  const queryChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }

  const filterNodes = (arr: RenderTree[], query: string): RenderTree[] => {
    return query ? arr.reduce((acc: RenderTree[], item: RenderTree) => {
      if (item.children?.length) {
        const filtered = filterNodes(item.children, query)
        if (filtered.length) return [...acc, { ...item, children: filtered }];
      }

      const { children, ...itemWithoutChildren } = item;
      return item.name?.toLowerCase().includes(query.toLowerCase()) ? [...acc, itemWithoutChildren] : acc
    }, []) : arr;
  };

  const deleteNodeHandler = (nodeId: string) => {
    const nodeToDelete = findNode(treeData, nodeId);
    if (nodeToDelete) {
      const hasDeleteAccess = checkAccess(nodeToDelete, 'delete');
      if (hasDeleteAccess) {
        const updatedTreeData = removeNode(treeData, nodeId);
        setTreeData(updatedTreeData);
        setFilteredData(filterNodes(updatedTreeData, query));
      } else {
        alert(`You don't have permission to delete this ${nodeToDelete.type}.`);
      }
    }
  };

  const findNode = (data: RenderTree[], nodeId: string): RenderTree | undefined => {
    for (const item of data) {
      if (item.id === nodeId) {
        return item;
      } else if (item.children?.length) {
        const foundInChildren = findNode(item.children, nodeId);
        if (foundInChildren) {
          return foundInChildren;
        }
      }
    }
    return undefined;
  };

  const checkAccess = (node: RenderTree, operation: UserOperations): boolean => {
    switch (operation) {
      case 'read':
        return ['read', 'readWrite'].includes(userPermission) && ['read', 'readWrite'].includes(node.access);
      case 'write':
        return ['write', 'readWrite'].includes(userPermission) && ['write', 'readWrite'].includes(node.access);
      case 'delete':
        return ['readWrite'].includes(userPermission) && ['readWrite'].includes(node.access);
      default:
        return false;
    }
  };

  const removeNode = (data: RenderTree[], nodeId: string): RenderTree[] => {
    return data.reduce((acc: RenderTree[], item: RenderTree) => {
      if (item.id === nodeId) {
        return acc;
      } else if (item.children?.length) {
        return [...acc, { ...item, children: removeNode(item.children, nodeId) }];
      } else {
        return [...acc, item];
      }
    }, []);
  };

  const moveNode = (folderId: string, nodeId: string) => {
    const sourceNode = findNode(treeData, nodeId);
    const destinationFolder = findNode(treeData, folderId);
    if (!sourceNode || !destinationFolder) {
      alert('Source node or destination folder not found.');
      return;
    }
    const sourceCopy = { ...sourceNode };
    const hasWriteAccess = checkAccess(sourceCopy, 'write');

    if (hasWriteAccess) {
      const updatedTreeWithoutSource = removeNode(treeData, nodeId);
      const destinationFolder = findNode(updatedTreeWithoutSource, folderId);

      if (!destinationFolder) {
        alert('Destination folder not found.');
        return;
      }

      destinationFolder.children = [...destinationFolder.children || [], sourceCopy];

      setTreeData(updatedTreeWithoutSource);
      setFilteredData(filterNodes(updatedTreeWithoutSource, query));
    } else {
      alert(`You don't have permission to move this ${sourceNode.type}.`);
    }
  };

  const moveNodeHandler = () => {
    setIsModalOpen(false);
    moveNode(selectedFolderId, selectedNodeId);
    setSelectedFolderId('');
  };

  const userPermissionHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setUserPermission(e.target.value as UserPermissions);
  };

  const renderTree = (nodes: RenderTree) => {
    const LabelIcon = <span data-testid={nodes.id} style={{ display: 'flex' }}>
      {nodes.type === 'folder' ?
        <FolderIcon sx={{ mr: 1 }} /> :
        <InsertDriveFileIcon sx={{ mr: 1 }} />}
      {nodes.name}
    </span>;

    return (
      <MuiTreeItem
        key={nodes.id}
        nodeId={nodes.id}
        label={LabelIcon}
        onClick={() => setSelectedNodeId(nodes.id)}
      >
        {Array.isArray(nodes.children)
          ? nodes.children.map((node) => renderTree(node))
          : null}
      </MuiTreeItem>
    )
  };

  return (
    <Box sx={{ minHeight: 110, flexGrow: 1, maxWidth: 300 }}>
      <TextField
        id='outlined-start-adornment'
        label='Search'
        role='search'
        sx={{ width: '100%', mb: 2 }}
        InputProps={{
          startAdornment: <InputAdornment position='start'>
            <PageviewIcon />
          </InputAdornment>,
        }}
        onChange={queryChangeHandler}
      />
      <Box sx={{ mb: 2 }}>
        <MuiTreeView
          aria-label='rich object'
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
        >
          {query ? filteredData.map((item) => renderTree(item)) : treeData.map((item) => renderTree(item))}
        </MuiTreeView>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button
          variant='outlined'
          onClick={() => deleteNodeHandler(selectedNodeId)}
        >
          Delete
        </Button>
        <Button
          ref={button}
          variant='outlined'
          onClick={() => setIsModalOpen(!isModalOpen)}
        >
          Move to ...
        </Button>
        <FoldersToMove
          anchorEl={button.current}
          data={treeData}
          open={isModalOpen}
          setFolderId={setSelectedFolderId}
          moveNodeHandler={moveNodeHandler}
        />
      </Box>
      <Box sx={{ mb: 2 }}>
        <TextField
          id='outlined-select-currency'
          select
          label='Permissions'
          value={userPermission}
          onChange={userPermissionHandler}
          sx={{ width: '100%' }}
        >
          {permissions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>
    </Box>
  );
}
