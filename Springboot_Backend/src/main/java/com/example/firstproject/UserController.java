package com.example.firstproject; 
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired; 
//import org.springframework.stereotype.Controller; 
//import org.springframework.ui.Model; 
//import org.springframework.web.bind.annotation.GetMapping; 
import org.springframework.web.bind.annotation.PostMapping; 
import org.springframework.web.bind.annotation.RestController; 
import org.springframework.web.bind.annotation.RequestBody; 
import org.springframework.web.bind.annotation.CrossOrigin; 
//@Controller 
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
@RestController 
@CrossOrigin(origins="http://localhost:3000")
public class UserController 
{ 
@Autowired 
UserRepository ur; 
@PostMapping("/reg") 
//String m(String uname,String email,String psw,Model x) 
String m(@RequestBody  Users nu)throws InterruptedException 
    { //Users eu=this.ur.findByusername(uname); 
        String uname=nu.getUsername(); 
        Users eu=this.ur.findByUsername(uname); 
        if(eu==null){ 
            this.ur.save(nu); 
            return "Registration Successful"; 
        } 
        return  "already exists with this username"; 
       
    } 

    @PostMapping("/login")
public String login(@RequestBody Users u) {

    Users dbUser = ur.findByUsername(u.getUsername());

    if (dbUser != null && dbUser.getPassword().equals(u.getPassword())) {
        return "success";
    }
    return "invalid";
}

    @GetMapping("/vdetails/{name}")
    Users m7(@PathVariable ("name") String data){
        Users u=this.ur.findByUsername(data);
        return u;
    }

    @GetMapping("/viewAll")
    List<Users> m8(){

        List<Users> all=this.ur.findAll();
        return all;

    } 

}
 
    /* @GetMapping("/h") 
    String m1() 
    { 
        return "home"; 
    } 
     @GetMapping("/login") 
    String m3() 
    { 
        return "login"; 
    } 
    @GetMapping("/a") 
    String m2() 
    { 
        return "admin"; 
    } 
     @PostMapping("/login") 
     String m4(String uname,String psw){ 
        //this.ur.findByusername(uname); 
        Users eu=this.ur.findByusername(uname); 
 
        if(eu!=null &&eu.getPassword().equals(psw)) 
        { 
            return "welcome"; 
        } 
        return "login"; 
     } 
 */