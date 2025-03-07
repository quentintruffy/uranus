import { initializePed } from '../../utils/spawnmanager';
import { AbstractPlugin } from '../types/AbstractPlugin';

export class LoadingScreenClient extends AbstractPlugin {
  protected async onLoad(): Promise<void> {
    this.setupLoadingScreen();
  }
  protected async onEnable(): Promise<void> {}
  protected async onDisable(): Promise<void> {}
  protected async onUnload(): Promise<void> {}

  private setupLoadingScreen(): void {
    on('onClientResourceStart', async (resourceName: string) => {
      if (GetCurrentResourceName() != resourceName) {
        return;
      }

      await initializePed();
    });
  }
}
