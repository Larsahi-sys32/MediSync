
using MediSyncApi.Data;
using MediSyncApi.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MediSyncApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly MediSyncContext _context;
        private readonly PasswordHasher<User> _hasher = new();

        public AuthController(MediSyncContext context)
        {
            _context = context;
        }

        // SIGNUP
        public record SignupRequest(string LoginId, string Password);

        [HttpPost("signup")]
        public async Task<IActionResult> Signup(
            [FromBody] SignupRequest request)
        {
            var loginId = request.LoginId.Trim();

            if (string.IsNullOrWhiteSpace(loginId) ||
                string.IsNullOrWhiteSpace(request.Password) ||
                request.Password.Length < 6)
            {
                return BadRequest(new
                {
                    message = "Enter a valid login and a password of at least 6 characters."
                });
            }

            if (await _context.Users.AnyAsync(
                u => u.LoginId == loginId))
            {
                return Conflict(new
                {
                    message = "An account with this email or phone already exists."
                });
            }

            var user = new User
            {
                LoginId = loginId
            };

            user.PasswordHash = _hasher.HashPassword(
                user, request.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                id = user.Id,
                loginId = user.LoginId
            });
        }

        // LOGIN
        public record LoginRequest(string LoginId, string Password);

        [HttpPost("login")]
        public async Task<IActionResult> Login(
            [FromBody] LoginRequest request)
        {
            var loginId = request.LoginId.Trim();

            var user = await _context.Users.FirstOrDefaultAsync(
                u => u.LoginId.ToLower() == loginId.ToLower());

            if (user == null)
            {
                return Unauthorized(new
                {
                    message = "Incorrect email/phone or password."
                });
            }

            var result = _hasher.VerifyHashedPassword(
                user, user.PasswordHash, request.Password);

            if (result == PasswordVerificationResult.Failed)
            {
                return Unauthorized(new
                {
                    message = "Incorrect email/phone or password."
                });
            }

            return Ok(new
            {
                id = user.Id,
                loginId = user.LoginId,
                role = user.Role,
                name = user.Name,
                age = user.Age,
                dateOfBirth = user.DateOfBirth,
                emergencyContact = user.EmergencyContact,
                photo = user.Photo
            });
        }

        // PROFILE UPDATE
        public record ProfileRequest(
            string Role,
            string Name,
            int? Age,
            DateTime? DateOfBirth,
            string EmergencyContact,
            string Photo
        );

        [HttpPut("profile/{id}")]
        public async Task<IActionResult> UpdateProfile(
            int id,
            [FromBody] ProfileRequest request)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "Account not found."
                });
            }

            user.Role = request.Role;
            user.Name = request.Name;
            user.Age = request.Age;
            user.DateOfBirth = request.DateOfBirth;
            user.EmergencyContact = request.EmergencyContact;
            user.Photo = request.Photo;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Profile updated successfully."
            });
        }

        // EMAIL UPDATE
        public record UpdateEmailRequest(string Email);

        [HttpPut("email/{id}")]
        public async Task<IActionResult> UpdateEmail(
            int id,
            [FromBody] UpdateEmailRequest request)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "Account not found."
                });
            }

            var newEmail = request.Email.Trim();

            if (string.IsNullOrWhiteSpace(newEmail) ||
                !newEmail.Contains("@") ||
                !newEmail.Contains("."))
            {
                return BadRequest(new
                {
                    message = "Enter a valid email address."
                });
            }

            var emailExists = await _context.Users.AnyAsync(
                u => u.LoginId.ToLower() == newEmail.ToLower()
                     && u.Id != id);

            if (emailExists)
            {
                return Conflict(new
                {
                    message = "This email is already being used by another account."
                });
            }

            user.LoginId = newEmail;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Email updated successfully.",
                loginId = user.LoginId
            });
        }
    }
}
