// ./containers/App.js
/* eslint-disable react/no-multi-comp */
import React, { Component } from 'react';
import ReactGA from 'react-ga';
import styled, { injectGlobal } from 'react-emotion';
import { AnalyticsListener } from '@verdigris/analytics';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { hot } from 'react-hot-loader';
import { withRouter } from 'react-router';
import * as PropTypes from 'prop-types';
import Document from '../pages/Document';
import Error from '../components/Error';
import Home from '../pages/Home';
import Loading from '../components/Loading';
import Nav from './Nav';
import PackagePage from '../pages/PackagePage';
import ApplicationPage from '../components/ApplicationPage';
import PageNotFound from '../pages/PageNotFound';
import RouteAnalyticsListener from '../components/RouteAnalyticsListener';
import { getDocs } from '../siteData';

class GoogleAnalyticsListener extends Component {
  static propTypes = {
    gaId: PropTypes.string,
  };

  constructor(props) {
    super(props);
    if (process.env.NODE_ENV === 'production') {
      ReactGA.initialize(props.gaId);
    }
  }

  render() {
    const { children } = this.props;
    return (
      <AnalyticsListener channel="navigate" onEvent={this.handleAnalyticsEvent}>
        <RouteAnalyticsListener>
          {children}
        </RouteAnalyticsListener>
      </AnalyticsListener>
    );
  }

  handleAnalyticsEvent = event => {
    ReactGA.pageview(event.payload.location.pathname);
  }
}

class ScrollToTop extends Component {
  componentDidUpdate(prevProps) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      window.scrollTo(0, 0);
    }
  }

  render() {
    return null;
  }
}

const ScrollHandler = withRouter(ScrollToTop);

class RouteBoundary extends Component {
  state = { hasError: false };

  componentDidCatch(error, info) {
    this.setState({ hasError: true, info, });
  }

  render() {
    const { hasError, info } = this.state;
    if (hasError) {
      return <Error stack={info.componentStack} />;
    }
    return this.props.children;
  }
}

const AppContent = styled.div`
  flex: 1 1 auto;
`;

injectGlobal`
body {
  margin: 0px;
  font-family: Roboto,Helvetica,Arial,"Lucida Grande",sans-serif;
  line-height: 1.5;
}
blockquote {
  background: lightyellow;
  border: 1px solid orange;
  padding: 1rem;
  margin: 0 1rem;
}
h2 {
  display: block;
  border-bottom: 1px solid darkgray;
}
table {
  width: 100%;
  border-collapse: collapse;
}
thead tr {
  border-bottom: 1px solid darkgray;
}
tr {
  &:nth-child(even){
    background: lightgray;
  }
}
th, td {
  padding: 0.5rem;
  text-align: left;
  vertical-align: top;

  ol, ul {
    padding: 0;
    margin: 0 0 0 1rem;
  }
}
`;

export default hot(module)(App);

function App(props) {
  const {
    gaId,
  } = props;
  return (
    <BrowserRouter>
      <GoogleAnalyticsListener gaId={gaId}>
        <Route>
          <ScrollHandler />
        </Route>
        <Switch>
          <Route>
            <RouteBoundary>
              <AppContent>
                <ApplicationPage nav={() => (
                  <Switch>
                    <Route path="/" component={Nav} />
                  </Switch>
                )}>
                  <Switch>
                    <Route exact path="/" component={Home} />
                    <Route exact path="/docs/:docSectionId/:docId" component={Document} />
                    <Route path="/docs/:docSectionId/:docId/edit" component={({ match: { params: { docId, docSectionId } } }) => {
                      const docSections = getDocs();
                      const docSection = docSections.find(d => d.id === docSectionId);
                      const routeDoc = docSection.pages.find(d => d.id === docId);
                      window.location.href = `https://github.com/andrew-codes/verdigris/edit/master/docs/${docSection.name}/${routeDoc.name}`;
                      return <Loading />;
                    }} />
                    <Route path="/packages/:packageName" component={PackagePage} />
                    <Route path="/error" component={PageNotFound} />
                    <Route component={PageNotFound} />
                  </Switch>
                </ApplicationPage>
              </AppContent>
            </RouteBoundary>
          </Route>
        </Switch>
      </GoogleAnalyticsListener>
    </BrowserRouter>
  );
}
