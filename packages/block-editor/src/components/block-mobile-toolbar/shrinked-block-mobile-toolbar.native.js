/**
 * External dependencies
 */
import { Platform } from 'react-native';

/**
 * WordPress dependencies
 */
import { ToolbarButton, Picker } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { withDispatch, withSelect } from '@wordpress/data';
import { withInstanceId, compose } from '@wordpress/compose';
import { moreVertical, trash, cog } from '@wordpress/icons';
import { partial, first, castArray, last } from 'lodash';
/**
 * Internal dependencies
 */
import {
	getMoverActionTitle,
	getArrowIcon,
} from '../block-mover/mover-description';

const ShrinkedBlockMobileToolbar = ( {
	onDelete,
	isStackedHorizontally,
	openGeneralSidebar,
	onMoveDown,
	onMoveUp,
	isFirst,
	isLast,
} ) => {
	const deleteOption = {
		id: 'deleteOption',
		label: __( 'Remove Block' ),
		value: 'deleteOption',
		icon: trash,
	};

	const settingsOption = {
		id: 'settingsOption',
		label: __( 'Block Settings' ),
		value: 'settingsOption',
		icon: cog,
	};

	const backwardButtonOption = {
		id: 'backwardButtonOption',
		label: getMoverActionTitle( true, isStackedHorizontally ),
		value: 'backwardButtonOption',
		icon: getArrowIcon( true, isStackedHorizontally ),
		disabled: isFirst,
	};

	const forwardButtonOption = {
		id: 'forwardButtonOption',
		label: getMoverActionTitle( false, isStackedHorizontally ),
		value: 'forwardButtonOption',
		icon: getArrowIcon( false, isStackedHorizontally ),
		disabled: isLast,
	};

	const options = [
		backwardButtonOption,
		forwardButtonOption,
		settingsOption,
		deleteOption,
	];

	function onPickerSelect( value ) {
		if ( value === 'deleteOption' ) {
			onDelete();
		} else if ( value === 'settingsOption' ) {
			openGeneralSidebar();
		} else if ( value === 'forwardButtonOption' ) {
			onMoveDown();
		} else if ( value === 'backwardButtonOption' ) {
			onMoveUp();
		}
	}

	return (
		<>
			<ToolbarButton
				onClick={ () => this.picker.presentPicker() }
				icon={ moreVertical }
			/>
			<Picker
				ref={ ( instance ) => ( this.picker = instance ) }
				options={ options }
				onChange={ onPickerSelect }
				destructiveButtonIndex={ options.length }
				hideCancelButton={ Platform !== 'ios' }
			/>
		</>
	);
};

export default compose(
	withSelect( ( select, { clientIds } ) => {
		const { getBlockIndex, getBlockRootClientId, getBlockOrder } = select(
			'core/block-editor'
		);
		const normalizedClientIds = castArray( clientIds );
		const firstClientId = first( normalizedClientIds );
		const rootClientId = getBlockRootClientId( firstClientId );
		const blockOrder = getBlockOrder( rootClientId );
		const firstIndex = getBlockIndex( firstClientId, rootClientId );
		const lastIndex = getBlockIndex(
			last( normalizedClientIds ),
			rootClientId
		);

		return {
			isFirst: firstIndex === 0,
			isLast: lastIndex === blockOrder.length - 1,
			rootClientId,
		};
	} ),
	withDispatch( ( dispatch, { clientIds, rootClientId } ) => {
		const { moveBlocksDown, moveBlocksUp } = dispatch(
			'core/block-editor'
		);
		const { openGeneralSidebar } = dispatch( 'core/edit-post' );

		return {
			onMoveDown: partial( moveBlocksDown, clientIds, rootClientId ),
			onMoveUp: partial( moveBlocksUp, clientIds, rootClientId ),
			openGeneralSidebar: () => openGeneralSidebar( 'edit-post/block' ),
		};
	} ),
	withInstanceId
)( ShrinkedBlockMobileToolbar );