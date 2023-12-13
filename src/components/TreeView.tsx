import React, { useState, ChangeEvent } from 'react';
// components
import Box from '@mui/material/Box';
import { TreeView as MuiTreeView } from '@mui/x-tree-view/TreeView';
import { TreeItem as MuiTreeItem } from '@mui/x-tree-view/TreeItem';
import { Input, InputAdornment } from '@mui/material';
// icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PageviewIcon from '@mui/icons-material/Pageview';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
// data
import response from '../assets/response.json';


interface RenderTree {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: RenderTree[];
}

export default function TreeView() {
  const [treeData, setTreeData] = useState<RenderTree[]>(response as RenderTree[]);

  const onQueryChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTreeData(filterBy(response as RenderTree[], e.target.value))
  }

  function filterBy(arr: RenderTree[], query: string): RenderTree[] {
    return query ? arr.reduce((acc: RenderTree[], item: RenderTree) => {
      if (item.children?.length) {
        const filtered = filterBy(item.children, query)
        if (filtered.length) return [...acc, { ...item, children: filtered }]
      }

      const { children, ...itemWithoutChildren } = item;
      return item.name?.toLowerCase().includes(query.toLowerCase()) ? [...acc, itemWithoutChildren] : acc
    }, []) : arr;
  }

  const renderTree = (nodes: RenderTree) => {
    const LabelIcon = <span style={{ display: 'flex' }}>
      {nodes.type === 'folder' ?
        <FolderIcon sx={{ marginRight: '10px' }} /> :
        <InsertDriveFileIcon sx={{ marginRight: '10px' }} />}
      {nodes.name}
    </span>;

    return (
      <MuiTreeItem
        key={nodes.id}
        nodeId={nodes.id}
        label={LabelIcon}
      >
        {Array.isArray(nodes.children)
          ? nodes.children.map((node) => renderTree(node))
          : null}
      </MuiTreeItem>
    )
  };

  return (
    <Box sx={{ minHeight: 110, flexGrow: 1, maxWidth: 300 }}>
      <Input
        id="input-with-icon-adornment"
        startAdornment={
          <InputAdornment position="start">
            <PageviewIcon />
          </InputAdornment>
        }
        sx={{ width: '100%', marginBottom: '10px' }}
        onChange={onQueryChange}
      />
      <MuiTreeView
        aria-label="rich object"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        {treeData.map((item) => renderTree(item))}
      </MuiTreeView>
    </Box>
  );
}