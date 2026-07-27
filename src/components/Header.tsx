import profile from '../assets/profile.png'
import {FAKE_CONTACTS} from "../services/mockWebSocket"
const Header = () => {
  return (
    <div className='bg-blue-500 flex items-center shrink-0'>
      <img src={profile} alt="Profile" 
      className="w-12 h-12 rounded-full m-3 "
      />
      <div>
        <h1 className='text-white text-xl font-medium'>Group Chat</h1>
      <h3 className='text-white' >{[...FAKE_CONTACTS,'you'].join(', ')}</h3>
      </div>
      
    </div>
  )
}

export default Header
