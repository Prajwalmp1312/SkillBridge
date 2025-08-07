// import axios from 'axios'
// import React, { useState } from 'react'
// // import "./Login.css"
// import { Link, useNavigate } from 'react-router-dom'


// const Login = () => {

//   let handleChange=(e)=>{
//         let {name,value}=e.target
//         setState({...state,[name]:value})
//     }

//     let handleSubmit=async(e)=>{
//         e.preventDefault()
//         if (user[Email] && user[Email] === Password) {
//       setIsLoggedIn(true); 
//       navigate('/shoppy');
//     } else {
//       alert("Invalid email or password!"); 
//       navigate('/login')
//     }
//   }




//   return (
//      <div id='d1'>
//      <center>
//         <div id='d22'></div>
//         <div id='d21'>
        
//         <form action="" id='fm' onSubmit={handleSubmit} autoComplete='off'>
//             <h1><b>Login-Page</b></h1> <br />
//             {/* <label htmlFor="name" className='lb'>Username:-</label><br />
//             <input type="text" name="" id="name" placeholder="Enter Username" className='in' /><br /><br /> */}
//             <label htmlFor="Email" className='lb'>Email-ID:-</label><br />
//             <input type="email" name="Email" id="mail"  placeholder="Enter Email-ID" className='in' onChange={handleChange} required/><br /><br />
//             <label htmlFor="Password" className='lb'>Password:-</label><br />
//             <input type="password" name="Password" id="pass"  placeholder="Enter Password" className='in' onChange={handleChange} required/><br /><br />
//             <button type="submit" id='lg' >Login</button><br /><br />
//             <button type="reset" id='set'>Reset</button>
//             <button id='can'>Cancel</button><br />
//             <a href="">Forgot Password?</a><br />
//             <h3>Don't have an account?<Link to="/signup" >Signup</Link></h3>
//         </form>

// </div>
        


//       </center>
//     </div>
//   )
// }

// export default Login


/*------------------------------------------------*/
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Login = () => {
  const [form, setForm] = useState({ Email: '', Password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Example: Replace with your backend API call
    // const res = await axios.post('http://localhost:6000/api/V1/student/signin', form);
    // if (res.data.token) { ... }
    if (form.Email === "test@example.com" && form.Password === "password") {
      navigate('/dashboard');
    } else {
      alert("Invalid email or password!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-300 via-blue-500 to-emerald-500">
      <div className="w-full max-w-md bg-white/10 backdrop-blur rounded-xl shadow-lg p-8">
        <form onSubmit={handleSubmit} autoComplete="off" className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-white text-center mb-2">Login Page</h1>
          <label htmlFor="mail" className="text-indigo-100 font-medium " >Email-ID:</label>
          <input
            type="email"
            name="Email"
            id="mail"
            placeholder="Enter Email-ID"
            className="px-4 py-2 rounded bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onChange={handleChange}
            value={form.Email}
            required
          />
          <label htmlFor="pass" className="text-indigo-100 font-medium">Password:</label>
          <input
            type="password"
            name="Password"
            id="pass"
            placeholder="Enter Password"
            className="px-4 py-2 rounded bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onChange={handleChange}
            value={form.Password}
            required
          />
          <button
            type="submit"
            className="bg-indigo-700 hover:bg-indigo-800 text-white font-semibold py-2 rounded transition"
          >
            Login
          </button>
          <div className="flex gap-2">
            <button type="reset" className="flex-1 bg-indigo-100 text-indigo-700 rounded py-2 font-semibold hover:bg-indigo-200 transition">Reset</button>
            <button type="button" className="flex-1 bg-red-400 text-white rounded py-2 font-semibold hover:bg-red-500 transition">Cancel</button>
          </div>
          <a href="#" className="text-xs text-indigo-200 hover:underline text-center mt-2">Forgot Password?</a>
          <h3 className="text-white text-center mt-2 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-yellow-300 font-semibold hover:underline">Signup</Link>
          </h3>
        </form>
      </div>
    </div>
  );
};

export default Login;