import { AbstractPlugin } from '../types/AbstractPlugin';

export class LoadingScreenServer extends AbstractPlugin {
  protected onLoad(): Promise<void> {}
  protected onEnable(): Promise<void> {}
  protected onDisable(): Promise<void> {}
  protected onUnload(): Promise<void> {}
}
