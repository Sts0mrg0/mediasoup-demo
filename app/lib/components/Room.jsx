import React from 'react';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import clipboardCopy from 'clipboard-copy';
import * as appPropTypes from './appPropTypes';
import { withRoomContext } from '../RoomContext';
import * as requestActions from '../redux/requestActions';
import { Appear } from './transitions';
import Me from './Me';
import Peers from './Peers';
import Notifications from './Notifications';

const Room = (
	{
		roomClient,
		room,
		me,
		amActiveSpeaker,
		onRoomLinkCopy
	}) =>
{
	return (
		<Appear duration={300}>
			<div data-component='Room'>
				<Notifications />

				<div className='state'>
					<div className={classnames('icon', room.state)} />
					<p className={classnames('text', room.state)}>{room.state}</p>
				</div>

				<div className='room-link-wrapper'>
					<div className='room-link'>
						<a
							className='link'
							href={room.url}
							target='_blank'
							rel='noopener noreferrer'
							onClick={(event) =>
							{
								// If this is a 'Open in new window/tab' don't prevent
								// click default action.
								if (
									event.ctrlKey || event.shiftKey || event.metaKey ||
									// Middle click (IE > 9 and everyone else).
									(event.button && event.button === 1)
								)
								{
									return;
								}

								event.preventDefault();

								clipboardCopy(room.url)
									.then(onRoomLinkCopy);
							}}
						>
							invitation link
						</a>
					</div>
				</div>

				<Peers />

				<div
					className={classnames('me-container', {
						'active-speaker' : amActiveSpeaker
					})}
				>
					<Me />
				</div>

				<div className='sidebar'>
					<div
						className={classnames('button', 'audio-only', {
							on       : me.audioOnly,
							disabled : me.audioOnlyInProgress
						})}
						data-tip='Toggle audio only mode'
						data-type='dark'
						onClick={() =>
						{
							me.audioOnly
								? roomClient.disableAudioOnly()
								: roomClient.enableAudioOnly();
						}}
					/>

					<div
						className={classnames('button', 'restart-ice', {
							disabled : me.restartIceInProgress
						})}
						data-tip='Restart ICE'
						data-type='dark'
						onClick={() => roomClient.restartIce()}
					/>
				</div>

				<ReactTooltip
					effect='solid'
					delayShow={100}
					delayHide={100}
				/>
			</div>
		</Appear>
	);
};

Room.propTypes =
{
	roomClient      : PropTypes.any.isRequired,
	room            : appPropTypes.Room.isRequired,
	me              : appPropTypes.Me.isRequired,
	amActiveSpeaker : PropTypes.bool.isRequired,
	onRoomLinkCopy  : PropTypes.func.isRequired
};

const mapStateToProps = (state) =>
{
	return {
		room            : state.room,
		me              : state.me,
		amActiveSpeaker : state.me.name === state.room.activeSpeakerName
	};
};

const mapDispatchToProps = (dispatch) =>
{
	return {
		onRoomLinkCopy : () =>
		{
			dispatch(requestActions.notify(
				{
					text : 'Room link copied to the clipboard'
				}));
		}
	};
};

const RoomContainer = withRoomContext(connect(
	mapStateToProps,
	mapDispatchToProps
)(Room));

export default RoomContainer;
