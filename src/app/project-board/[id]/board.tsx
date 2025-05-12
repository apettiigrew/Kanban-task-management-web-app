import { autoScrollWindowForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';
import React, {
    memo,
    useEffect,
    type ReactNode
} from 'react';
import styles from './board.module.scss'; // <-- Import the SCSS module
import { useBoardContext } from './board-context';


type BoardProps = {
  children?: ReactNode;
  ref?: React.Ref<HTMLDivElement>; // React 19 ref prop
};

function Board({ children, ref }: BoardProps) {
  const { instanceId } = useBoardContext();

  useEffect(() => {
		return autoScrollWindowForElements({
			canScroll: ({ source }) => source.data.instanceId === instanceId,
		});
	}, [instanceId]);

  return (
    <div className={styles.board} ref={ref}>
      {children}
    </div>
  );
}
export default memo(Board);