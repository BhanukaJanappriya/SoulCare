import React from 'react';
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import MoodTracker from './MoodTracker'
import Activity from './Activity'
import HabbitTracker from './HabbitTracker';
import DailyProgress from './dailyProgress';
import Meditation from './Meditation';

const UserDashboard: React.FC = () => {
    return(
        <div className='flex'>
            <Sidebar/>
            <div className='flex-1 p-6'>
                <TopBar/>
                <h2 className='text-2xl font-semibold mt-6 text-heading'>Hi, Bhanuka!</h2>
                <div className='grid grid-cols-3 gap-4 mt-6'>
                    <MoodTracker/>
                    <Activity/>
                </div>
                <div className='grid grid-cols-3 gap-4 mt-4'>
                    <HabbitTracker/>
                    <DailyProgress/>
                    <Meditation/>
                </div>


            </div>

        </div>
    )
}
export default UserDashboard;