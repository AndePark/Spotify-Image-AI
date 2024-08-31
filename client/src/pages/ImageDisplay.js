import { useState, useEffect } from 'react';
import { compressImage, convertPngToJpeg} from '../utils';
import { changeImage } from '../spotify';


const ImageDisplay = ({ base64Image, id, onImageChange}) => {
  const [jpegBase, setJpegBase] = useState(null);

  useEffect(() => {
    const compress = async () => {
      try {
        const compressedBase64Image = await compressImage(base64Image);
        const jpedBase64Image = await convertPngToJpeg(compressedBase64Image);
        setJpegBase(jpedBase64Image);
      } catch (error) {
        console.error('Image compression failed:', error);
      }
    };

    compress();
  }, [base64Image, id]);


  useEffect(() => {
    const upload = async () => {
      try {
      const response = await changeImage(jpegBase, id);
      // console.log(response.status);
      if (response.status && onImageChange) {
        onImageChange();
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      }
    };

    upload();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[id, jpegBase])

  return null;
};

export default ImageDisplay;

