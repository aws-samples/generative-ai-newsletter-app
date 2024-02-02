// import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import '@aws-amplify/ui-react/styles.css';
import "@cloudscape-design/global-styles/index.css"
import './App.css'
import GlobalHeader from './components/global-header';
import Welcome from './pages/welcome';
import NewslettersDashboard from "./pages/newsletters/dashboard";
import CreateNewsletter from "./pages/newsletters/create";
import EditNewsletter from "./pages/newsletters/edit";
import NewsletterDetail from "./pages/newsletters/detail";
import DataFeedsDashboard from "./pages/data-feeds/dashboard";
import CreateDataFeed from "./pages/data-feeds/create";
import DataFeedDetails from "./pages/data-feeds/detail";
import MyNewsletters from "./pages/newsletters/my-newsletters";
import MyNewsletterSubscriptions from "./pages/newsletters/my-subscriptions";
import EditDataFeed from "./pages/data-feeds/edit";
function App() {
  return (
    <div style={{ height: "100%" }}>
      <BrowserRouter>
        <GlobalHeader />
        <div style={{ height: "56px", backgroundColor: "#000716" }}>&nbsp;</div>
        <div>
          <Routes>
            <Route index path="/" element={<Welcome />} />
            <Route path="/newsletters" element={<NewslettersDashboard />} />
            <Route path="/newsletters/my-newsletters" element={<MyNewsletters />}/>
            <Route path="/newsletters/my-subscriptions" element={<MyNewsletterSubscriptions/>}/>
            <Route path="/newsletters/create" element={<CreateNewsletter />} />
            <Route path="/newsletters/:newsletterId" element={<NewsletterDetail />} />
            <Route path="/newsletters/:newsletterId/edit" element={<EditNewsletter />} />
            <Route path="/feeds" element={<DataFeedsDashboard />} />
            <Route path="/feeds/create" element={<CreateDataFeed />} />
            <Route path="/feeds/:subscriptionId" element={<DataFeedDetails />} />
            <Route path="/feeds/:subscriptionId/edit" element={<EditDataFeed />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  )
}

export default App
