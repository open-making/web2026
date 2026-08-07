export function getDisplayName(name: string | null, username: string, caseType: 'lowercase' | 'uppercase' | 'capitalize'): string {
  if (name) {
    const firstName = name.split(' ')[0];

    switch (caseType) {
      case 'lowercase':
        return firstName.toLowerCase();
      case 'uppercase':
        return firstName.toUpperCase();
      case 'capitalize':
      default:
        return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    }
  }

  // Apply the same case transformation to username if no name is provided
  switch (caseType) {
    case 'lowercase':
      return username.toLowerCase();
    case 'uppercase':
      return username.toUpperCase();
    case 'capitalize':
    default:
      return username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();
  }
}