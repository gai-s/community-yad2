import React from 'react'
import {useState, useEffect} from 'react'
import {useNavigate, Link} from 'react-router-dom'
import {getAuth, updateProfile} from 'firebase/auth'
import {collection, query, getDocs, updateDoc, where, orderBy, doc, deleteDoc} from 'firebase/firestore'
import {db} from '../firebase.config'
import ListingItem from '../components/ListingItem'
import {toast} from 'react-toastify'
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg'
import homeIcon from '../assets/svg/homeIcon.svg'

function Profile() {
  const auth = getAuth()
  const [changeDetails, setChangeDetails] = useState(false)
  const [listings, setListings] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email
  })
  const {name, email} = formData

useEffect(() => {
  const fetchUserListings = async() => {
      try{
          //get reference
          const listingsRef = collection(db, 'listings')

          //create a query
          const q = query(
              listingsRef, 
              where('userRef', '==', auth.currentUser.uid),
              orderBy('timestamp', 'desc'),
              )
          const querySnap = await getDocs(q)
          let listings = []

          querySnap.forEach((doc) => {
               listings.push({
                  id: doc.id,
                  data: doc.data()
              })
          })
          setListings(listings)
          setLoading(false)
      }catch(error){
          toast.error("Could not fetch user's listings")
      }
  }
  fetchUserListings()
}, [auth.currentUser.uid])

  const onLogOut = () => {
    auth.signOut()
    navigate('/')
  }

  const onSubmit = async () => {
    try{
      if(auth.currentUser.displayName !== name){
          //update display name in fb
          await updateProfile(auth.currentUser, {
            displayName: name
          })

          //update in firestore
          const userRef = doc(db , 'users', auth.currentUser.uid)
          await updateDoc(userRef, {
            name
          })
        }
    }catch(error){
        toast.error('Could not update profile details')
    }
  }

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value
    }))
  }

  const onDelete = async(listingId) =>{
    if(window.confirm('Are you sure you want to delete')){
      await deleteDoc(doc(db, 'listings', listingId))
      const updatedListings = listings.filter((listing) => listing.id !== listingId)
      setListings(updatedListings)
      toast.success('Listing has been successfully deleted')
    }
  }

  const onEdit = (listingId) => navigate(`/edit-listing/${listingId}`)

  return (
  <div className="profile">
    <header className="profileHeader">
      <p className="pageHeader">My Profile</p>
      <button type="button" className="logOut" onClick={onLogOut}>
        Log Out
      </button>
    </header>
    <main>
      <div className="profileDetailsHeader">
        <p className="personalDetailsText">Personal Details</p>
        <p className="changePersonalDetails" onClick={() => {
          changeDetails && onSubmit()
          setChangeDetails((prevState) => !prevState)
        }}>
          {changeDetails ? 'done' : 'change'}
        </p>
      </div>

      <div className="profileCard">
        <form>
          <input type="text" 
          id="name" 
          className={!changeDetails ? 'profileName' : 'profileNameActive'}
          disabled={!changeDetails}
          value={name}
          onChange={onChange}
          />
          <input type="text" 
          id="email" 
          className={!changeDetails ? 'profileEmail' : 'profileEmailActive'}
          disabled={!changeDetails}
          value={email}
          onChange={onChange}
          />
        </form>
      </div>
        {!loading && listings.length>0 && (
          <>
          <p className="listingText">Your Listings</p>
          <ul className="listinsList">
              {listings.map((listing) => (
                <ListingItem key={listing.id} listing={listing.data} id={listing.id} onEdit={() => onEdit(listing.id)} onDelete={() => onDelete(listing.id)}/>
              ))}
          </ul>
          </>
        )}

      <Link to='/create-listing' className='createListing'>
        <img src={homeIcon} alt='home' />
        <p>Sell or rent a new place</p>
        <img src={arrowRight} alt="arrow right" />
      </Link>
    </main>
  </div>
  )
}

export default Profile