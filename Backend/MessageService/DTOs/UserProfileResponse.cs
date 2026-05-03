namespace MessageService.DTOs
{
    /// <summary>
    /// DTO matching UserService.UserProfileDto shape (read-only).
    /// MessageService fetches this from UserService via HTTP to enrich member profiles.
    /// </summary>
    public class UserProfileResponse
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string? DisplayName { get; set; }
        public string? FullName { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Bio { get; set; }
    }
}
