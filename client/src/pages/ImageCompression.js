// import Compressor from 'compressorjs';

// // Function to convert base64 to Blob
// const base64ToBlob = (base64) => {
//   const byteString = atob(base64.split(',')[1]);
//   const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
//   const ab = new ArrayBuffer(byteString.length);
//   const ia = new Uint8Array(ab);
//   for (let i = 0; i < byteString.length; i++) {
//     ia[i] = byteString.charCodeAt(i);
//   }
//   return new Blob([ab], { type: mimeString });
// };

// // Function to check the size of a base64 string
// const base64SizeInKB = (base64) => {
//   return (base64.length * 3) / 4 / 1024; // Approximate size in KB
// };

// // Function to compress the image to be at most 256KB
// export const compressImage = (base64Image, targetSizeKB = 256) => {
//   return new Promise((resolve, reject) => {
//     const blob = base64ToBlob(base64Image);
//     const compress = (quality) => {
//       new Compressor(blob, {
//         quality,
//         success: (compressedBlob) => {
//           const reader = new FileReader();
//           reader.readAsDataURL(compressedBlob);
//           reader.onloadend = () => {
//             const dataURL = reader.result;
//             const base64String = dataURL.split(',')[1];
//             const sizeKB = base64SizeInKB(base64String);

//             if (sizeKB <= targetSizeKB || quality <= 0.1) { // Stop if size is within limit or quality is too low
//               resolve(base64String);
//             } else {
//               // Reduce quality and try again
//               compress(quality - 0.1); // Decrease quality by 10%
//             }
//           };
//           reader.onerror = (error) => {
//             reject(error);
//           };
//         },
//         error: (err) => {
//           reject(err);
//         },
//       });
//     };

//     compress(1); // Start with maximum quality
//   });
// };
