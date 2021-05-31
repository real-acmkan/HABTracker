import type {Drawer} from '@material/mwc-drawer';

export const initDrawer = () => {
  const infoButton = <HTMLElement>document.querySelector('#fab-info');
  const drawer = <Drawer>document.querySelectorAll<Drawer>('mwc-drawer')[0];
  const closeDrawerButton = <HTMLElement>(
    document.querySelector('#close-drawer-button')
  );

  if (drawer) {
    infoButton.onclick = () => {
      drawer.open = !drawer.open;
    };

    closeDrawerButton.onclick = () => {
      drawer.open = !drawer.open;
    };
  }
};
