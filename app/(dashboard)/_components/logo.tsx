import Image
 from "next/image";
const Logo = () => {
    return ( 
       <Image src="/lms.svg" alt="Logo" width={130} height={130} />
     );
}
 
export default Logo;