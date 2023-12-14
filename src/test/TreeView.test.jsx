import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TreeView from '../components/TreeView';

describe('TreeView', () => {
  it('should render only the "beach.jpg" file when searched for', () => {
    const { queryByTestId } = render(<TreeView />);

    // Enter a query in the input field
    const input = screen.getByRole('search').querySelector('input');
    fireEvent.change(input, { target: { value: 'beach.jpg' } });

    // Check if the My Documents folder is not rendered
    expect(queryByTestId('folder-a9738921')).toBeNull();

    // Click to uncollapse My Images children list
    fireEvent.click(queryByTestId('folder-70fjh13i'));
    // Click to uncollapse Vacation Photos children list
    fireEvent.click(queryByTestId('folder-532a23k3'));

    // Check if the "mountains.jpg" file is not rendered
    expect(queryByTestId('file-12df45l78')).toBeNull();
    // Check if the "beach.jpg" file is rendered
    expect(queryByTestId('file-9iop54f2')).toBeInTheDocument();
  });
});