import React from 'react'
import {useState, useEffect} from 'react'
import {Link, useParams, useNavigate} from 'react-router-dom'
import {doc, getDoc} from 'firebase/firestore'
import {getAuth} from 'firebase/auth'
import useAuthStatus from '../hooks/useAuthStatus'
import {db} from '../firebase.config'
import Spinner from '../components/Spinner'
import {toast} from 'react-toastify'
import shareIcon from '../assets/svg/shareIcon.svg'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

// Import Swiper styles
import 'swiper/swiper-bundle.css'
SwiperCore.use([Navigation, Pagination, Scrollbar, A11y])

function Listing() {
    const [listing, setListing] = useState(null)
    const [loading, setLoading] = useState(true)
    const [shareLinkCopied, setShareLinkCopied] = useState(false)
    const {loggedIn, checkingStatus} = useAuthStatus()
    
    const params = useParams()
    const navigate = useNavigate()
    const auth = getAuth()

    useEffect(() => {
        const fetchListing = async () => {
            const categoryName = params.categoryName
            const listingId = params.listingId
            const docSnap = await getDoc(doc(db, 'listings', listingId))
            if(docSnap.exists()){
                console.log(docSnap.data())
                setListing(docSnap.data())
                setLoading(false)
            }
        }
        fetchListing()

    }, [navigate, params.categoryName, params.listingId, checkingStatus])

    if(loading || checkingStatus){
        return <Spinner />
    }

    if(!listing){
        toast.error('No such listing exist')
        navigate(`/category/${params.categoryName}`)
    }
   
  return (
    <main>
      <Swiper slidesPerView={1} pagination={{ clickable: true }}>
        {listing.imgUrls.map((url, index) => (
          <SwiperSlide key={index}>
            <div
              className='swiperSlideDiv'
              style={{
                background: `url(${url}) center no-repeat`,
                backgroundSize: 'contain',
              }}
            ></div>
          </SwiperSlide>
        ))}
      </Swiper>

        <div className="shareIconDiv" onClick={ () => {
            navigator.clipboard.writeText(window.location.href)
            setShareLinkCopied(true)
            setTimeout( () => {
                setShareLinkCopied(false)
            }, 2000)
        }}>
            <img src={shareIcon} alt="" />
        </div>

        {shareLinkCopied && <p className='linkCopied'> Link Copied!</p>}

        <div className="listingDetails">
            <p className="listingName">
                {listing.name} - ₪{listing.offer ? listing.discountPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : listing.regularPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </p>
            <p className="listingLocation">{listing.location}</p>
            <p className="listingType">
                For {listing.type ==='rent' ? 'Rent' : 'Sale'}
            </p>
            {listing.offer && (
                <p className="discountPrice">₪{listing.regularPrice - listing.discountPrice} discount</p>
            )}
        
            <ul className="listingDetailsList">
                <li>
                    {listing.bedrooms > 1 ? `${listing.bedrooms} Bedrooms` : `1 Bedrooms`}
                </li>
                <li>
                    {listing.bathrooms > 1 ? `${listing.bathrooms} Bathrooms` : `1 Bathrooms`}
                </li>
                <li>{listing.parking && 'Parking Spot'}</li>
                <li>{(listing.furnished==='Furnished'||listing.furnished==='Half-furnished') && listing.furnished}</li>
            </ul>

            <p className="listingLocationTitle">Location</p>
            <div className='leafletContainer'>
                <MapContainer
                    style={{ height: '100%', width: '100%' }}
                    center={[listing.geolocation.lat, listing.geolocation.long]}
                    zoom={13}
                    scrollWheelZoom={false}
                >
                    <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url='https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png'
                    />

                    <Marker
                    position={[listing.geolocation.lat, listing.geolocation.long]}
                    >
                    <Popup>{listing.location}</Popup>
                    </Marker>
                </MapContainer>
            </div>
            {(!loggedIn || (loggedIn && auth.currentUser.uid !== listing.userRef)) && (
                <Link to={`/contact/${listing.userRef}?listingName=${listing.name}`} className='primaryButton' style={{maxWidth: "350px"}}>
                    Contact Landlord
                </Link>
            )}


        </div>

    </main>
  )
}

export default Listing
