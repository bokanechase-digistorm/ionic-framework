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

  it('should preserve tab history when clearing with a tab-specific route', () => {
    locationHistory.add({ id: '1', pathname: '/tabs/tab1', tab: 'tab1', position: 0 });
    locationHistory.add({ id: '2', pathname: '/tabs/tab1/view1', tab: 'tab1', position: 1, pushedByRoute: '/tabs/tab1' });
    locationHistory.add({ id: '3', pathname: '/tabs/tab2', tab: 'tab2', position: 2 });
    locationHistory.add({ id: '4', pathname: '/tabs/tab1/view1', tab: 'tab1', position: 3, pushedByRoute: '/tabs/tab1' });

    /**
     * Simulates replacing a route within a tab.
     * When the route has a tab property, clearHistory
     * should only clear that specific tab's history at the given position,
     * preserving other tabs' history.
     */
    const replaceRoute = { id: '5', pathname: '/tabs/tab1/view2', tab: 'tab1', position: 3, routerAction: 'replace' };
    locationHistory.clearHistory(replaceRoute);
    locationHistory.add(replaceRoute);

    // Tab 2 history should be unaffected
    const tab2Current = locationHistory.getCurrentRouteInfoForTab('tab2');
    expect(tab2Current.pathname).toEqual('/tabs/tab2');

    // Tab 1 history should have the replaced route
    const tab1Current = locationHistory.getCurrentRouteInfoForTab('tab1');
    expect(tab1Current.pathname).toEqual('/tabs/tab1/view2');
  });

  it('should add replaced route to tab history when tab is set', () => {
    locationHistory.add({ id: '1', pathname: '/tabs/tab1', tab: 'tab1', position: 0 });
    locationHistory.add({ id: '2', pathname: '/tabs/tab1/view1', tab: 'tab1', position: 1, pushedByRoute: '/tabs/tab1' });

    // Simulate a replace within tab1
    const replaceRoute = { id: '3', pathname: '/tabs/tab1/view2', tab: 'tab1', position: 1, pushedByRoute: '/tabs/tab1' };
    locationHistory.clearHistory(replaceRoute);
    locationHistory.add(replaceRoute);

    const tab1Current = locationHistory.getCurrentRouteInfoForTab('tab1');
    expect(tab1Current.pathname).toEqual('/tabs/tab1/view2');

    const tab1First = locationHistory.getFirstRouteInfoForTab('tab1');
    expect(tab1First.pathname).toEqual('/tabs/tab1');
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
});
