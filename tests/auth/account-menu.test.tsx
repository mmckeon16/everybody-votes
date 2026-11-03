import React from 'react';
import { act, create, ReactTestInstance, ReactTestRenderer } from 'react-test-renderer';
import { Modal } from 'react-native';
import HeaderActions from '../../app/components/HeaderActions';

const mockDelete = jest.fn();
const mockSession = { user: { id: 'test-menu-account', email: 'menu-account@example.test' } };
jest.mock('../../app/context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: true, session: mockSession, deleteAccount: mockDelete, signOut: jest.fn() }),
}));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('../../components/ThemeToggle', () => ({ ThemeToggle: () => null }));
jest.mock('../../components/ui/button', () => ({ Button: (props: unknown) => require('react').createElement('button', props) }));
jest.mock('../../components/ui/input', () => ({ Input: (props: unknown) => require('react').createElement('input', props) }));
jest.mock('../../components/ui/text', () => ({ Text: (props: unknown) => require('react').createElement('text', props) }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function button(tree: ReactTestRenderer, label: string): ReactTestInstance {
  return tree.root.findAll(node => node.type === 'button' && node.findAll(child => child.type === 'text').some(text => text.children.includes(label)))[0];
}

test('deletion needs explicit confirmation and blocks same-tick duplicate actions and closing', async () => {
  let tree!: ReactTestRenderer;
  let finish!: () => void;
  mockDelete.mockImplementation(() => new Promise<void>(resolve => { finish = resolve; }));
  await act(async () => { tree = create(<HeaderActions />); });
  try {
    await act(async () => button(tree, 'Account').props.onPress());
    await act(async () => button(tree, 'Delete account').props.onPress());
    expect(tree.root.findAll(node => node.type === 'text' && node.children.includes(mockSession.user.email))).toHaveLength(1);
    expect(button(tree, 'Permanently delete account').props.disabled).toBe(true);
    // Even an accidental invocation of the disabled handler cannot delete.
    await act(async () => button(tree, 'Permanently delete account').props.onPress());
    expect(mockDelete).not.toHaveBeenCalled();
    await act(async () => tree.root.findByProps({ accessibilityLabel: 'Account deletion confirmation' }).props.onChangeText('DELETE'));
    const confirm = button(tree, 'Permanently delete account');
    const cancel = button(tree, 'Cancel');
    await act(async () => {
      confirm.props.onPress();
      confirm.props.onPress();
      cancel.props.onPress();
    });
    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(tree.root.findByType(Modal).props.visible).toBe(true);
    expect(button(tree, 'Cancel').props.disabled).toBe(true);
    await act(async () => { finish(); });
    expect(tree.root.findByType(Modal).props.visible).toBe(false);
  } finally {
    await act(async () => tree.unmount());
  }
});
