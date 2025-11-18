import { createLocationHistory } from '../src/locationHistory';

let locationHistory;
describe('Location History', () => {
  beforeEach(() => {
    locationHistory = createLocationHistory();
  });

  it('should correctly add an item to location history', () => {
    locationHistory.add({ pathname: '/' });
    expect(locationHistory.canGoBack(1)).toEqual(false);
  });

  it('should correctly replace an item to location history', () => {
    locationHistory.add({ pathname: '/home' });
    locationHistory.add({ pathname: '/login', routerAction: 'replace' });

    const current = locationHistory.last();
    expect(current.pathname).toEqual('/login');
  });

  it('should correctly pop an item from location history', () => {
    locationHistory.add({ pathname: '/home' });
    locationHistory.add({ pathname: '/login', routerAction: 'pop' });

    const current = locationHistory.last();
    expect(current.pathname).toEqual('/login');
    expect(locationHistory.canGoBack(1)).toEqual(false);
  });

  it('should correctly wipe location history when routerDirection is root', () => {
    locationHistory.add({ pathname: '/home' });
    locationHistory.add({ pathname: '/login' });
    locationHistory.add({ pathname: '/logout', routerDirection: 'root' });

    const current = locationHistory.last();
    expect(current.pathname).toEqual('/logout');
    expect(locationHistory.canGoBack(1)).toEqual(false);
  });

  it('should correctly update a route', () => {
    locationHistory.add({ id: '1', pathname: '/tabs/tab1', tab: 'tab1' });
    locationHistory.add({ id: '2', pathname: '/tabs/tab2' });

    const current = { ...locationHistory.last() };
    current.tab = 'tab2';

    locationHistory.update(current);

    const getCurrentAgain = locationHistory.last();
    expect(getCurrentAgain.tab).toEqual('tab2');
  });

  it('should correctly get the first route for a tab', () => {
    locationHistory.add({ id: '1', pathname: '/tabs/tab1', tab: 'tab1' });
    locationHistory.add({ id: '2', pathname: '/tabs/tab1/child', tab: 'tab1' });
    locationHistory.add({ id: '2', pathname: '/tabs/tab1/child/1', tab: 'tab1' });

    const first = locationHistory.getFirstRouteInfoForTab('tab1');
    expect(first.pathname).toEqual('/tabs/tab1');
  });

  it('should correctly get the current route for a tab', () => {
    locationHistory.add({ id: '1', pathname: '/tabs/tab1', tab: 'tab1' });
    locationHistory.add({ id: '2', pathname: '/tabs/tab1/child', tab: 'tab1' });
    locationHistory.add({ id: '2', pathname: '/tabs/tab1/child/1', tab: 'tab1' });

    const first = locationHistory.getCurrentRouteInfoForTab('tab1');
    expect(first.pathname).toEqual('/tabs/tab1/child/1');
  });

  it('should correctly get last route', () => {
    locationHistory.add({ pathname: '/home' });
    locationHistory.add({ pathname: '/login' });

    const current = locationHistory.last();
    expect(current.pathname).toEqual('/login');
  });

  it('should correctly determine if we can go back', () => {
    locationHistory.add({ pathname: '/home' });
    locationHistory.add({ pathname: '/login' });

    expect(locationHistory.canGoBack(1, 0, 1)).toEqual(true);
    expect(locationHistory.canGoBack(2, 0, 1)).toEqual(false);
  });

  it('should correctly find the last location', () => {
    const [home, pageA, pageB, pageC] = [
      { pathname: '/home' },
      { pathname: '/page-a', pushedByRoute: '/home' },
      { pathname: '/page-b', pushedByRoute: '/page-a' },
      { pathname: '/page-c', pushedByRoute: '/page-b' },
    ];

    locationHistory.add(home);
    locationHistory.add(pageA);
    locationHistory.add(pageB);
    locationHistory.add(pageC);

    expect(locationHistory.findLastLocation(pageB)).toEqual(pageA);
    expect(locationHistory.findLastLocation(pageB, -2)).toEqual(home);

    expect(locationHistory.findLastLocation(pageC)).toEqual(pageB);
    expect(locationHistory.findLastLocation(pageC, -2)).toEqual(pageA);
    expect(locationHistory.findLastLocation(pageC, -3)).toEqual(home);
  });

  it('should preserve tab history when replacing with root direction within a tab', () => {
    // Simulate navigation within a tab
    locationHistory.add({ id: '1', pathname: '/tabs/tab1', tab: 'tab1' });
    locationHistory.add({ id: '2', pathname: '/tabs/tab1/view1', tab: 'tab1', pushedByRoute: '/tabs/tab1' });
    
    // Switch to another tab
    locationHistory.add({ id: '3', pathname: '/tabs/tab2', tab: 'tab2' });
    
    // Switch back to first tab
    locationHistory.add({ id: '4', pathname: '/tabs/tab1/view1', tab: 'tab1', pushedByRoute: '/tabs/tab1' });
    
    // Replace view1 with view2 using root direction (simulating ionRouter.replace)
    locationHistory.add({ id: '5', pathname: '/tabs/tab1/view2', tab: 'tab1', routerAction: 'replace', routerDirection: 'root', pushedByRoute: '/tabs/tab1' });
    
    // Tab history should still exist
    const tab1History = locationHistory.getCurrentRouteInfoForTab('tab1');
    expect(tab1History).toBeDefined();
    expect(tab1History.pathname).toEqual('/tabs/tab1/view2');
    
    // Should be able to find the first route for the tab
    const firstTab1Route = locationHistory.getFirstRouteInfoForTab('tab1');
    expect(firstTab1Route).toBeDefined();
    expect(firstTab1Route.pathname).toEqual('/tabs/tab1');
  });
});
