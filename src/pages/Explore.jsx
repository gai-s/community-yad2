import React from 'react'
import {Link} from 'react-router-dom'
import Slider from '../components/Slider'
import rentCategoryImage from '../assets/jpg/rentCategoryImage.jpg'
import sellCategoryImage from '../assets/jpg/sellCategoryImage.jpg'


function Explore() {
  return (
    <div className='explore'>
      <header>
        <p className="pageHeader">Hadar Community Yad2 - Explore</p>
      </header>

      <main>
        <Slider />
        <p className="exploreCategoryHeading">Categories</p>
        <div className="exploreCategories">
          <Link to='/category/rent'>
            <img src={rentCategoryImage} alt='rent' className="exploreCategoryImg" />
            <p className="exploreCategoryName">Places for Rent</p>
          </Link>
          <Link to='/category/sale'>
            <img src={sellCategoryImage} alt='sell' className="exploreCategoryImg" />
            <p className="exploreCategoryName">Places for Sale</p>
          </Link>
        </div>
      </main>
    </div>
  )
}

export default Explore