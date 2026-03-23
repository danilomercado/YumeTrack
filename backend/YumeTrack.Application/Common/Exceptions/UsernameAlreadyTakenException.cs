namespace YumeTrack.Application.Common
{
    public class UsernameAlreadyTakenException : Exception
    {
        public List<string> Suggestions { get; }

        public UsernameAlreadyTakenException(string message, List<string> suggestions)
            : base(message)
        {
            Suggestions = suggestions;
        }
    }
}