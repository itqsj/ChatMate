import { useCallback, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { deleteLocalChat } from '@renderer/api/chat';
import { deleteWorkspace } from '@renderer/api/workspace';
import {
  removeChat,
  removeWorkspace,
  setFolderMessage,
} from '@renderer/store/codeMateSlice';
import { useAppDispatch } from '@renderer/store/hooks';
import type { CodeMateChat, CodeMateWorkspace } from '@renderer/types/codeMate';

export type DeleteConfirmTarget =
  | {
      item: CodeMateChat;
      type: 'chat';
    }
  | {
      item: CodeMateWorkspace;
      type: 'workspace';
    };

type DeleteConfirmDialogProps = {
  onClose: () => void;
  onDeleted: (target: DeleteConfirmTarget) => void;
  target: DeleteConfirmTarget | null;
};

/**
 * 工作区和会话共用的删除确认弹窗。
 */
export default function DeleteConfirmDialog({
  onClose,
  onDeleted,
  target,
}: DeleteConfirmDialogProps) {
  const dispatch = useAppDispatch();
  const [isDeleting, setIsDeleting] = useState(false);
  const isWorkspace = target?.type === 'workspace';
  const dialogTitle = isWorkspace ? '确认删除工作区' : '确认删除会话';
  const contentText = isWorkspace
    ? `删除后会移除“${target?.item.name || ''}”及其下面的任务和消息记录。`
    : `删除后会移除“${target?.item.title || ''}”及其消息记录。`;

  /**
   * 正在删除时不允许关闭，避免状态和数据库结果不一致。
   */
  const handleClose = useCallback(() => {
    if (!isDeleting) {
      onClose();
    }
  }, [isDeleting, onClose]);

  /**
   * 根据删除对象类型执行对应的本地 SQLite 删除操作。
   */
  const handleConfirmDelete = useCallback(async () => {
    if (!target) {
      return;
    }

    setIsDeleting(true);

    try {
      if (target.type === 'workspace') {
        await deleteWorkspace(target.item.id);
        dispatch(removeWorkspace(target.item.id));
        dispatch(setFolderMessage(`已删除工作区：${target.item.name}`));
      } else {
        await deleteLocalChat(target.item.id);
        dispatch(removeChat(target.item.id));
        dispatch(setFolderMessage(`已删除会话：${target.item.title}`));
      }

      onDeleted(target);
      onClose();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete local data', error);
      dispatch(
        setFolderMessage(
          target.type === 'workspace'
            ? '删除工作区失败，请稍后重试'
            : '删除会话失败，请稍后重试',
        ),
      );
    } finally {
      setIsDeleting(false);
    }
  }, [dispatch, onClose, onDeleted, target]);

  return (
    <Dialog
      open={Boolean(target)}
      onClose={handleClose}
      aria-labelledby="delete-confirm-dialog-title"
    >
      <DialogTitle id="delete-confirm-dialog-title">{dialogTitle}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ fontSize: 13 }}>
          {contentText}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button disabled={isDeleting} onClick={handleClose}>
          取消
        </Button>
        <Button
          color="error"
          disabled={isDeleting}
          onClick={handleConfirmDelete}
        >
          {isDeleting ? '删除中...' : '确认删除'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
