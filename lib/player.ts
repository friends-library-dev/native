import { EventEmitter } from 'events';
import RNTrackPlayer from 'react-native-track-player';
import { TrackData, PlayerState } from '../types';
import { Dispatch } from '../state';

class Player extends EventEmitter {
  private ducked = false;

  public dispatch: Dispatch = (): any => {};

  public skipNext(): Promise<void> {
    return RNTrackPlayer.skipToNext();
  }

  public skipBack(): Promise<void> {
    return RNTrackPlayer.skipToPrevious();
  }

  public resume(): Promise<void> {
    this.ducked = false;
    return RNTrackPlayer.play();
  }

  public stop(): Promise<void> {
    return RNTrackPlayer.stop();
  }

  public duck(): Promise<void> {
    this.ducked = true;
    return RNTrackPlayer.pause();
  }

  public pause(): Promise<void> {
    return RNTrackPlayer.pause();
  }

  public getPosition(): Promise<number> {
    return RNTrackPlayer.getPosition();
  }

  public getCurrentTrackId(): Promise<string> {
    return RNTrackPlayer.getCurrentTrack();
  }

  public seekTo(position: number): Promise<void> {
    return RNTrackPlayer.seekTo(position);
  }

  public async seekRelative(delta: number): Promise<void> {
    const currentPosition = await RNTrackPlayer.getPosition();
    this.seekTo(currentPosition + delta);
  }

  public async getState(): Promise<PlayerState> {
    const RNState = await RNTrackPlayer.getState();
    switch (RNState) {
      case RNTrackPlayer.STATE_PLAYING:
      case RNTrackPlayer.STATE_BUFFERING:
        return `PLAYING`;
      case RNTrackPlayer.STATE_PAUSED:
        return this.ducked ? `DUCKED` : `PAUSED`;
      default:
        return `STOPPED`;
    }
  }

  public async playPart(trackId: string, tracks: TrackData[]): Promise<void> {
    this.ducked = false;
    await RNTrackPlayer.reset();
    RNTrackPlayer.add(
      tracks.map((track) => ({
        id: track.id,
        url: track.filepath,
        title: track.title,
        artist: track.artist,
        artwork: track.artworkUrl,
        duration: track.duration,
        pitchAlgorithm: RNTrackPlayer.PITCH_ALGORITHM_VOICE,
      })),
    );
    await RNTrackPlayer.skip(trackId);
    return RNTrackPlayer.play();
  }

  public init(): void {
    RNTrackPlayer.setupPlayer({
      iosCategory: `playback`,
      iosCategoryMode: `spokenAudio`,
      iosCategoryOptions: [`allowAirPlay`],
    });

    RNTrackPlayer.updateOptions({
      stopWithApp: false,
      jumpInterval: 30,
      // @ts-ignore
      alwaysPauseOnInterruption: true,
      capabilities: [
        RNTrackPlayer.CAPABILITY_PLAY,
        RNTrackPlayer.CAPABILITY_PAUSE,
        RNTrackPlayer.CAPABILITY_SEEK_TO,
        RNTrackPlayer.CAPABILITY_STOP,
        RNTrackPlayer.CAPABILITY_JUMP_FORWARD,
        RNTrackPlayer.CAPABILITY_JUMP_BACKWARD,
      ],
    });
  }

  public addEventListener(
    event: RNTrackPlayer.EventType,
    listener: (data: any) => void,
  ): RNTrackPlayer.EmitterSubscription {
    return RNTrackPlayer.addEventListener(event, listener);
  }
}

export default new Player();
