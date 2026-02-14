namespace UserService.Models;

public class UserProfile
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; } // From AuthService
    public string? DisplayName { get; set; }
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public string? CoverImageUrl { get; set; }
    public DateTime DateOfBirth { get; set; }
    public string? Location { get; set; }
    public string? Website { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation property
    public ICollection<SocialLink> SocialLinks { get; set; } = new List<SocialLink>();
}
