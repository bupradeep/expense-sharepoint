import * as React from 'react';
import { TextField } from '@fluentui/react/lib/TextField';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import { expenseService } from '../../../../services/expenseService';
import { IExpenseClaim } from '../../../../models/IExpenseClaim';
import { IExpenseComment } from '../../../../models/IExpenseComment';
import { IUser } from '../../../../models/IUser';
import { ApiError } from '../../../../models/IApiError';
import { formatDateTime } from '../../../../utils/Formatters';
import ErrorMessage from './ErrorMessage';
import TableCard from './TableCard';
import styles from './ClaimComments.module.scss';

export interface IClaimCommentsProps {
  claim: IExpenseClaim;
  currentUser: IUser;
}

const ClaimComments: React.FC<IClaimCommentsProps> = (props) => {
  const [comments, setComments] = React.useState<IExpenseComment[]>(props.claim.Comments || []);
  const [text, setText] = React.useState<string>('');
  const [posting, setPosting] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>(undefined);

  const post = (): void => {
    if (!text.trim()) {
      return;
    }

    setPosting(true);
    setError(undefined);

    expenseService.addComment(props.claim.ExpenseClaimId, {
      userId: props.currentUser.UserId,
      commentText: text.trim()
    })
      .then((updated) => {
        setComments(updated);
        setText('');
        setPosting(false);
      })
      .catch((err: ApiError) => {
        setPosting(false);
        setError(err.message);
      });
  };

  return (
    <TableCard title="Comments">
      <Stack tokens={{ childrenGap: 8 }}>
        {error && <ErrorMessage message={error} />}
        {comments.length === 0 && <Text variant="small">No comments yet.</Text>}
        {comments.map((comment) => (
          <div className={styles.comment} key={comment.ExpenseClaimCommentId}>
            <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
              <Text className={styles.author}>{comment.User?.FullName || 'Unknown'}</Text>
              <Text variant="small" className={styles.timestamp}>{formatDateTime(comment.CreatedAt)}</Text>
            </Stack>
            <Text className={styles.text}>{comment.CommentText}</Text>
          </div>
        ))}
        <Stack horizontal tokens={{ childrenGap: 8 }} verticalAlign="end">
          <TextField
            className={styles.input}
            placeholder="Add a comment..."
            multiline
            rows={2}
            value={text}
            onChange={(_e, value) => setText(value || '')}
          />
          <PrimaryButton text="Post" onClick={post} disabled={posting || !text.trim()} />
        </Stack>
      </Stack>
    </TableCard>
  );
};

export default ClaimComments;
