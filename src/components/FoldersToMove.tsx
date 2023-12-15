import React, { useEffect, useState } from 'react';
// components
import {
  Button,
  Fade,
  Paper,
  Popper,
  Box,
} from '@mui/material';
import {
  TreeItem as MuiTreeItem,
  TreeView as MuiTreeView,
} from '@mui/x-tree-view';
// icons
import {
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  Folder as FolderIcon,
  InsertDriveFile as InsertDriveFileIcon,
} from '@mui/icons-material';
// types
import { RenderTree } from './types';


interface FoldersToMoveProps {
  anchorEl: HTMLButtonElement | null,
  data: RenderTree[],
  open: boolean,
  setFolderId: (folderId: string) => void,
  moveNodeHandler: () => void,
}

export default function FoldersToMove({
  anchorEl,
  data,
  open,
  setFolderId,
  moveNodeHandler
}: FoldersToMoveProps) {
  const [folders, setFolders] = useState<RenderTree[]>([]);

  useEffect(() => {
    setFolders(filterFolders(data));
  }, [data])

  const filterFolders = (arr: RenderTree[]): RenderTree[] => {
    return arr.reduce((acc: RenderTree[], item: RenderTree) => {
      if (item.children?.length) {
        const filtered = filterFolders(item.children);
        if (filtered.length) return [...acc, { ...item, children: filtered }];
      }

      const { children, ...itemWithoutChildren } = item;
      if (item.type === 'folder') {
        return [...acc, itemWithoutChildren];
      }

      return acc;
    }, []);
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
        onClick={() => setFolderId(nodes.id)}
      >
        {Array.isArray(nodes.children)
          ? nodes.children.map((node) => renderTree(node))
          : null}
      </MuiTreeItem>
    )
  };

  return (
    <Popper
      sx={{ zIndex: 10 }}
      open={open}
      anchorEl={anchorEl}
      placement='right-start'
      transition
      modifiers={[
        {
          name: 'arrow',
          enabled: true,
          options: {
            element: anchorEl,
          },
        },
      ]}
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={350}>
          <Paper variant='outlined' sx={{ p: 1 }}>
            <MuiTreeView
              aria-label='rich object'
              defaultCollapseIcon={<ExpandMoreIcon />}
              defaultExpandIcon={<ChevronRightIcon />}
            >
              {folders.map((item: RenderTree) => renderTree(item))}
            </MuiTreeView>
            <Box sx={{ display: 'flex', }}>
              <Button
                variant='outlined'
                onClick={() => moveNodeHandler()}
              >
                Ok
              </Button>
            </Box>
          </Paper>
        </Fade>
      )}
    </Popper>
  );
}
