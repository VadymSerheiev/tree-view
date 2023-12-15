export type UserPermissions = 'read' | 'write' | 'readWrite';

export type UserOperations = 'read' | 'write' | 'delete';

export interface RenderTree {
  id: string;
  name: string;
  type: 'folder' | 'file';
  access: UserPermissions;
  children?: RenderTree[];
}
