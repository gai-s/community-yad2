import React from 'react'
import {ReactComponent as ExploreIcon} from '../assets/svg/exploreIcon.svg'
import {ReactComponent as OfferIcon} from '../assets/svg/localOfferIcon.svg'
import {ReactComponent as PersonIcon} from '../assets/svg/personOutlineIcon.svg'

import {NavLink, useLocation, useNavigate} from 'react-router-dom'

function Navbar() {
  const location = useLocation()
  const routeMatchLocation = (route) =>
  {
    return route===location.pathname
  }
  return (
    <footer className="navbar">
      <nav className="navbarNav">
        <ul className="navbarListItems">
          <li className="navbarListItem">
              <NavLink to='/'>
              <ExploreIcon fill={routeMatchLocation('/') ? '#2c2c2c' : '#8f8f8f' } width='36px' height='36px'/>
              <p className={routeMatchLocation('/')? 'navbarListItemNameActive':'navbarListItemName'}>Explore</p>
              </NavLink>      
            </li>
          <li className="navbarListItem" >
              <NavLink to='/offers'>
              <OfferIcon fill={routeMatchLocation('/offers') ? '#2c2c2c' : '#8f8f8f' } width='36px' height='36px'/>
              <p className={routeMatchLocation('/offers')? 'navbarListItemNameActive':'navbarListItemName'}>Offers</p>
              </NavLink>
              </li>
          <li className="navbarListItem">
              <NavLink to='/profile'>
              <PersonIcon fill={routeMatchLocation('/profile') ? '#2c2c2c' : '#8f8f8f'}width='36px' height='36px'/>
              <p className={routeMatchLocation('/profile')? 'navbarListItemNameActive':'navbarListItemName'}>Profile</p>
              </NavLink>
            </li>
        </ul>
      </nav>
    </footer>
  )
}

export default Navbar