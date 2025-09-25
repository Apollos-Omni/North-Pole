import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import HingeControl from "./HingeControl";

import HomeWorld from "./HomeWorld";

import SecurityMonitor from "./SecurityMonitor";

import Store from "./Store";

import CommandCenter from "./CommandCenter";

import Feed from "./Feed";

import HomelessToHomeowner from "./HomelessToHomeowner";

import Unsent from "./Unsent";

import VisionTracker from "./VisionTracker";

import VisionDetail from "./VisionDetail";

import Profile from "./Profile";

import Organizations from "./Organizations";

import Settings from "./Settings";

import SettingsProfile from "./SettingsProfile";

import SettingsAccount from "./SettingsAccount";

import SettingsAppearance from "./SettingsAppearance";

import SettingsDangerZone from "./SettingsDangerZone";

import SettingsPlaceholder from "./SettingsPlaceholder";

import SettingsPrivacy from "./SettingsPrivacy";

import SettingsNotifications from "./SettingsNotifications";

import SettingsPayments from "./SettingsPayments";

import SettingsIdentity from "./SettingsIdentity";

import SettingsSecurity from "./SettingsSecurity";

import SettingsData from "./SettingsData";

import SettingsRegional from "./SettingsRegional";

import SettingsIntegrations from "./SettingsIntegrations";

import SettingsSupport from "./SettingsSupport";

import HingeAdmin from "./HingeAdmin";

import HomeLayoutDesigner from "./HomeLayoutDesigner";

import Sweepstakes from "./Sweepstakes";

import Promotions from "./Promotions";

import CreatorPortal from "./CreatorPortal";

import Arcade from "./Arcade";

import CreateMatch from "./CreateMatch";

import SantaClause from "./SantaClause";

import MVP from "./MVP";

import AgentDashboard from "./AgentDashboard";

import ComplianceDashboard from "./ComplianceDashboard";

import MyHeavenOS from "./MyHeavenOS";

import ContactUs from "./ContactUs";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    HingeControl: HingeControl,
    
    HomeWorld: HomeWorld,
    
    SecurityMonitor: SecurityMonitor,
    
    Store: Store,
    
    CommandCenter: CommandCenter,
    
    Feed: Feed,
    
    HomelessToHomeowner: HomelessToHomeowner,
    
    Unsent: Unsent,
    
    VisionTracker: VisionTracker,
    
    VisionDetail: VisionDetail,
    
    Profile: Profile,
    
    Organizations: Organizations,
    
    Settings: Settings,
    
    SettingsProfile: SettingsProfile,
    
    SettingsAccount: SettingsAccount,
    
    SettingsAppearance: SettingsAppearance,
    
    SettingsDangerZone: SettingsDangerZone,
    
    SettingsPlaceholder: SettingsPlaceholder,
    
    SettingsPrivacy: SettingsPrivacy,
    
    SettingsNotifications: SettingsNotifications,
    
    SettingsPayments: SettingsPayments,
    
    SettingsIdentity: SettingsIdentity,
    
    SettingsSecurity: SettingsSecurity,
    
    SettingsData: SettingsData,
    
    SettingsRegional: SettingsRegional,
    
    SettingsIntegrations: SettingsIntegrations,
    
    SettingsSupport: SettingsSupport,
    
    HingeAdmin: HingeAdmin,
    
    HomeLayoutDesigner: HomeLayoutDesigner,
    
    Sweepstakes: Sweepstakes,
    
    Promotions: Promotions,
    
    CreatorPortal: CreatorPortal,
    
    Arcade: Arcade,
    
    CreateMatch: CreateMatch,
    
    SantaClause: SantaClause,
    
    MVP: MVP,
    
    AgentDashboard: AgentDashboard,
    
    ComplianceDashboard: ComplianceDashboard,
    
    MyHeavenOS: MyHeavenOS,
    
    ContactUs: ContactUs,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/HingeControl" element={<HingeControl />} />
                
                <Route path="/HomeWorld" element={<HomeWorld />} />
                
                <Route path="/SecurityMonitor" element={<SecurityMonitor />} />
                
                <Route path="/Store" element={<Store />} />
                
                <Route path="/CommandCenter" element={<CommandCenter />} />
                
                <Route path="/Feed" element={<Feed />} />
                
                <Route path="/HomelessToHomeowner" element={<HomelessToHomeowner />} />
                
                <Route path="/Unsent" element={<Unsent />} />
                
                <Route path="/VisionTracker" element={<VisionTracker />} />
                
                <Route path="/VisionDetail" element={<VisionDetail />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/Organizations" element={<Organizations />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/SettingsProfile" element={<SettingsProfile />} />
                
                <Route path="/SettingsAccount" element={<SettingsAccount />} />
                
                <Route path="/SettingsAppearance" element={<SettingsAppearance />} />
                
                <Route path="/SettingsDangerZone" element={<SettingsDangerZone />} />
                
                <Route path="/SettingsPlaceholder" element={<SettingsPlaceholder />} />
                
                <Route path="/SettingsPrivacy" element={<SettingsPrivacy />} />
                
                <Route path="/SettingsNotifications" element={<SettingsNotifications />} />
                
                <Route path="/SettingsPayments" element={<SettingsPayments />} />
                
                <Route path="/SettingsIdentity" element={<SettingsIdentity />} />
                
                <Route path="/SettingsSecurity" element={<SettingsSecurity />} />
                
                <Route path="/SettingsData" element={<SettingsData />} />
                
                <Route path="/SettingsRegional" element={<SettingsRegional />} />
                
                <Route path="/SettingsIntegrations" element={<SettingsIntegrations />} />
                
                <Route path="/SettingsSupport" element={<SettingsSupport />} />
                
                <Route path="/HingeAdmin" element={<HingeAdmin />} />
                
                <Route path="/HomeLayoutDesigner" element={<HomeLayoutDesigner />} />
                
                <Route path="/Sweepstakes" element={<Sweepstakes />} />
                
                <Route path="/Promotions" element={<Promotions />} />
                
                <Route path="/CreatorPortal" element={<CreatorPortal />} />
                
                <Route path="/Arcade" element={<Arcade />} />
                
                <Route path="/CreateMatch" element={<CreateMatch />} />
                
                <Route path="/SantaClause" element={<SantaClause />} />
                
                <Route path="/MVP" element={<MVP />} />
                
                <Route path="/AgentDashboard" element={<AgentDashboard />} />
                
                <Route path="/ComplianceDashboard" element={<ComplianceDashboard />} />
                
                <Route path="/MyHeavenOS" element={<MyHeavenOS />} />
                
                <Route path="/ContactUs" element={<ContactUs />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}