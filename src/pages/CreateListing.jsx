import React from 'react'
import {useState, useEffect, useRef} from 'react'
import {db} from '../firebase.config'
import {getAuth, onAuthStateChanged} from 'firebase/auth'
import {getStorage, ref, uploadBytesResumable, getDownloadURL} from 'firebase/storage'
import {addDoc, collection, serverTimestamp} from 'firebase/firestore'
import {useNavigate} from 'react-router-dom'
import Spinner from '../components/Spinner'
import {toast} from 'react-toastify'
import {v4 as uuidv4} from 'uuid'

function CreateListing() {
    // eslint-disable-next-line
    const[geolocationEnable, setGeolocationEnable] = useState(true)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        type: 'rent',
        name: '',
        bedrooms: 1,
        bathrooms: 1,
        parking: false,
        furnished: "Not-furnished",
        address: '',
        offer: false,
        regularPrice: 0,
        discountPrice: 0,
        images: {},
        latitude: 0,
        longitude: 0
    })

    const {
        type,
        name,
        bedrooms,
        bathrooms,
        parking,
        furnished,
        address,
        offer,
        regularPrice,
        discountPrice,
        images,
        latitude,
        longitude,
      } = formData

    const auth = getAuth()
    const navigate = useNavigate()
    const isMounted = useRef(true)

    useEffect(() => {
        if(isMounted){
            onAuthStateChanged(auth, (user) => {
                if(user) {
                    setFormData({...formData, userRef: user.uid})
                }
                else{
                    navigate('/sign-in')
                }
            })
        }
        return () => {isMounted.current = false}
            // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMounted])

    const onSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        let geolocation = {}
        if(discountPrice >= regularPrice){
            setLoading(false)
            toast.error('Discounted price must be less than regular price')
            return
        }
        if(images.length > 6){
            setLoading(false)
            toast.error('6 images Max')
            return
        }
        if( geolocationEnable ){
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${address}&format=geojson`)
            const data = await response.json()
            console.log(data)
            if( !data || (data.features===0) || !data.features.length || data.features === 'undefined'){
                setLoading(false)
                toast.error('Address not Found')
                return
            }
            geolocation.long = data.features[0]?.geometry.coordinates[0]??0
            geolocation.lat = data.features[0]?.geometry.coordinates[1]??0
            console.log(geolocation)
        }else{
            geolocation.long = longitude 
            geolocation.lat = latitude
        }

        // Store images in firebase

        const storeImage = async (image) => {
            return new Promise( (resolve, reject) => {
                const storage = getStorage()
                const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`
                const storageRef = ref(storage, 'images/'+ fileName)
                const uploadTask = uploadBytesResumable(storageRef, image)

                uploadTask.on('state_changed', 
                (snapshot) => {
                  // Observe state change events such as progress, pause, and resume
                  // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                  const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                  console.log('Upload is ' + progress + '% done');
                  switch (snapshot.state) {
                    case 'paused':
                      console.log('Upload is paused');
                      break;
                    case 'running':
                      console.log('Upload is running');
                      break;
                    default:
                        break;
                  }
                }, 
                (error) => {
                    reject(error)
                }, 
                () => {
                  // Handle successful uploads on complete
                  // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                  getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL)
                  })
                }
              )            

            })
        }

        let imgUrls = await Promise.all(
            [...images].map((image) => storeImage(image))
            ).catch( () => {
                setLoading(false)
                toast.error('Images upload error')
                return
            })
        
        const formDataCopy = {
            ...formData,
            imgUrls,
            location: address,
            geolocation,
            timestamp: serverTimestamp()
        }
        delete formDataCopy.images
        delete formDataCopy.longitude
        delete formDataCopy.latitude
        delete formDataCopy.address
        !formDataCopy.offer && delete formDataCopy.discountPrice

        
        const docRef = await addDoc(collection( db, 'listings'), formDataCopy)
        setLoading(false)
        toast.success('Listing save')
        navigate(`/Category/${formDataCopy.type}/${docRef.id}`)
    }

    const onMutate = (e) => {
        let boolean = null
        if(e.target.value === 'true'){
            boolean = true
        }
        if(e.target.value === 'false'){
            boolean = false
        }
        if(e.target.files){
            setFormData( (prevState) => ({
                ...prevState,
                images: e.target.files
            })
        )
        }
        else{
            setFormData( (prevState) => ({
                ...prevState,
                [e.target.id]: boolean ?? e.target.value,
            })
        )
        }
        console.log(e.target)
    }


    if(loading) {
        return <Spinner />
    }

    return (
    <div className='profile'>
      <header>
        <p className="pageHeader">Create a Listing</p>
      </header>

      <main>
        <form onSubmit={onSubmit}>
            <label className='formLabel'>Sell / rent</label>
            <div className="formButton">
                <button
                type="button"
                className={type === 'sale' ? 'formButtonActive' : 'formButton' }
                id = 'type'
                value = 'sale'
                onClick={onMutate}
                >sell
                </button>
                <button
                type="button"
                className={type === 'rent' ? 'formButtonActive' : 'formButton' }
                id = 'type'
                value = 'rent'
                onClick={onMutate}
                >rent
                </button>
            </div>
            <label className='formLabel'>Name</label>
            <input className='formInputName'
            type="text"
            id='name'
            value={name}
            onChange={onMutate}
            maxLength='32'
            minLength='10'
            required />

            <div className="formRooms flex">
                <div>
                    <label className="formLabel">Bedrooms</label>
                    <input 
                        className='formInputSmall'
                        type="number"
                        id='bedrooms'
                        value={bedrooms}
                        onChange={onMutate}
                        min='1'
                        max='50'
                        required />
                </div>
                <div>
                    <label className="formLabel">Bathrooms</label>
                    <input 
                        className='formInputSmall'
                        type="number"
                        id='bathrooms'
                        value={bathrooms}
                        onChange={onMutate}
                        min='1'
                        max='50'
                        required />
                </div>
            </div>
            <label className='formLabel'>Parking spot</label>
            <div className="formButton">
                <button
                    className={parking ? 'formButtonActive' : 'formButton'}
                    type='button'
                    id='parking'
                    value={true}
                    onClick={onMutate}
                >
                    Yes
                </button>
                <button
                    className={!parking && parking!==null ? 'formButtonActive' : 'formButton'}
                    type='button'
                    id='parking'
                    value={false}
                    onClick={onMutate}
                >
                    No
                </button>
            </div>
            <label className='formLabel'>Furnished</label>
            <div className="formButtons">
                <button
                    className = {furnished==='Furnished' ? 'formButtonActive' : 'formButton' }
                    type = 'button'
                    id='furnished'
                    value='Furnished'
                    onClick={onMutate}  
                >
                    Furnished
                </button>
                <button
                    className = {furnished==='Half-furnished' ? 'formButtonActive' : 'formButton' }
                    type = 'button'
                    id='furnished'
                    value='Half-furnished'
                    onClick={onMutate}  
                >
                    Half-furnished
                </button>
                <button
                    className = {furnished==='Not-furnished' ? 'formButtonActive' : 'formButton' }
                    type = 'button'
                    id='furnished'
                    value='Not-furnished'
                    onClick={onMutate}  
                >
                    Not-furnished
                </button>
            </div>   
            <label className='formLabel'>Address</label>
            <textarea
                className='formInputAddress'
                type='text'
                id='address'
                value={address}
                onChange={onMutate}
                required
            /> 
            {!geolocationEnable && (
                <div className='formLatLng flex'>
                    <div>
                        <label className="formLabel">Latitude</label>
                        <input
                            className='formInputSmall'
                            type='number'
                            id='latitude'
                            value={latitude}
                            onChange={onMutate}
                            required
                        />
                    </div>
                    <div>
                        <label className="formLabel">Longitude</label>
                        <input
                            className='formInputSmall'
                            type='number'
                            id='longitude'
                            value={longitude}
                            onChange={onMutate}
                            required
                        />
                    </div>
                </div>
            )}

            <label className='formLabel'>Offer</label>
            <div className="formButtons">
                <button
                    className={ offer ? 'formButtonActive' : 'formButton'}
                    type='button'
                    id='offer'
                    value="true"
                    onClick={onMutate}
                >
                    Yes
                </button>
                <button
                    className={ !offer && offer!==null ? 'formButtonActive' : 'formButton'}
                    type='button'
                    id='offer'
                    value="false"
                    onClick={onMutate}
                >
                    No
                </button>
            </div>

            <label className='formLabel'>Regular Price</label>
            <div className="formPriceDiv">
                <input
                    className='formInputSmall'
                    type='number'
                    id='regularPrice'
                    value={regularPrice}
                    onChange={onMutate}
                    min='50'
                    max='75000'
                    required
                />
                {type ==='rent' && <p className='formPriceText'>₪ / Month</p>}
            </div>

            {offer && (
                <>
                    <label className='formLabel'>Discounted Price</label>
                    <input
                        className='formInputSmall'
                        type='number'
                        id='discountPrice'
                        value={discountPrice}
                        onChange={onMutate}
                        min='50'
                        max='75000'
                        required={offer}
                    />
                </>
            )}

            <label className='formLabel'>Images</label>
            <p className="imagedInfo">
                The first image will be the cover (max 6).
            </p>
            <input
                className='formInputFile'
                type='file'
                id='images'
                onChange={onMutate}
                max='6'
                accept='.jpg,.png,.jpeg'
                multiple
                required
            />

            <button type='submit' className='primaryButton createListingButton' style={{maxWidth: "350px"}}>
                Create Listing
            </button>
        </form>
      </main>
    </div>
  )
}

export default CreateListing
