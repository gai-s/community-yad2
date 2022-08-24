import React from 'react'
import {useEffect, useState} from 'react'
import {useParams} from 'react-router-dom'
import {db} from '../firebase.config'
import {collection, getDocs, query, where, orderBy, limit, startAfter} from 'firebase/firestore'
import {toast} from 'react-toastify'
import ListingItem from '../components/ListingItem'
import Spinner from '../components/Spinner'

function Category() {
    const [listings, setListings] = useState(null)
    const [loading, setLoading] = useState(true)
    const [lastFetchedListing, setLastFetchedListing] = useState(null)

    const params = useParams()
    useEffect(() => {
        const fetchListings = async() => {
            try{
                //get reference
                const listingsRef = collection(db, 'listings')

                //create a query
                const q = query(
                    listingsRef, 
                    where('type', '==', params.categoryName),
                    orderBy('timestamp', 'desc'),
                    limit(1)
                    )
                const querySnap = await getDocs(q)
                const lastVisible = querySnap.docs[querySnap.docs.length-1]
                setLastFetchedListing(lastVisible)
                const listings = []

                querySnap.forEach((doc) => {
                    listings.push({
                        id: doc.id,
                        data: doc.data()
                    })
                })
                setListings(listings)
                setLoading(false)
            }catch(error){
                toast.error("Could not fetch listings")
            }
        }
        fetchListings()
    }, [params.categoryName])

    // Pagination / load more
    const onFetchMoreListings = async() => {
        try{
            //get reference
            const listingsRef = collection(db, 'listings')

            //create a query
            const q = query(
                listingsRef, 
                where('type', '==', params.categoryName),
                orderBy('timestamp', 'desc'),
                startAfter(lastFetchedListing),
                limit(10)
                )
            const querySnap = await getDocs(q)
            const lastVisible = querySnap.docs[querySnap.docs.length-1]?? null
            console.log("lastVisible is: ", lastVisible)
            setLastFetchedListing(lastVisible)
            const listings = []

            querySnap.forEach((doc) => {
                listings.push({
                    id: doc.id,
                    data: doc.data()
                })
            })
            setListings((prevState) => [...prevState, ...listings])
            setLoading(false)
        }catch(error){
            toast.error("Could not fetch listings")
        }
    }
  return (
    <div className="category">
        <header>
            <p className="pageHeader">
                {params.categoryName === 'rent' ? 'Places for rent' : 'Places for Sale'}
            </p>
        </header>

        {loading ? (<Spinner />) : listings && listings.length > 0 ? ( 
        <>
            <main>
                <ul className="categoryListings">
                    {listings.map((listing) => (
                        <ListingItem key={listing.id} listing={listing.data} id={listing.id}>{listing.data.name}</ListingItem>
                    ))}
                </ul>
            </main>

            <br />
            <br />
            {lastFetchedListing && (
                <p className="loadMore" onClick={onFetchMoreListings}>Love More</p>
            )}

        </>
        ) : (
            <p>No Listings for {params.categoryName}</p>
        )}
    </div>
  )
}

export default Category
