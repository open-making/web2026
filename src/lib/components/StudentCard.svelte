<script lang="ts">
	export let student: {
		username: string;
		name: string | null;
		website: string | null;
		socialLinks: string[];
	};

	// Generate initials from name or username
	function getInitials(name: string | null, username: string): string {
		if (name) {
			return name
				.split(' ')
				.map((part) => part.charAt(0).toUpperCase())
				.slice(0, 2)
				.join('');
		}
		return username.charAt(0).toUpperCase() + (username.charAt(1) || '').toUpperCase();
	}

	// Get display name (first name or username)
	function getDisplayName(name: string | null, username: string): string {
		if (name) {
			const firstName = name.split(' ')[0];
			return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
		}
		return username;
	}

	$: initials = getInitials(student.name, student.username);
	$: displayName = getDisplayName(student.name, student.username);
	$: avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials)}&backgroundColor=f3f4f6&textColor=374151`;
</script>

<a href="/{student.username}" class="student-card" aria-label="View {displayName}'s profile">
	<div class="avatar-container">
		<img src={avatarUrl} alt="{displayName}'s avatar" class="avatar" />
	</div>
	<div class="student-info">
		<h3 class="student-name">{displayName}</h3>
		<p class="student-username">@{student.username}</p>
	</div>
</a>

<style>
	.student-card {
		display: flex;
		flex-direction: row;
		justify-content: start;
		align-items: center;
		padding: 0.5rem 1.5rem;
		background: white;
		gap: 1rem;
		border: 2px solid black;
		border-radius: 6px;
		text-decoration: none;
		color: inherit;
		transition: all 0.2s ease;
		position: relative;
		overflow: hidden;
	}

	.student-card:hover {
		/* transform: translateY(-4px); */
		box-shadow: rgba(0, 0, 0, 0.25) 0px 8px 24px;
		/* border-color: var(--color-purple, #8b5cf6); */
	}

	.student-card:focus {
		outline: none;
		/* border-color: var(--color-purple, #8b5cf6); */
		box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
	}

	.avatar-container {
		/* margin-bottom: 1rem; */
		position: relative;
	}

	.avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 1px solid black;
		background: white;
		transition: transform 0.2s ease;
	}

	.student-name {
		font-family: 'LibreCaslonCondensed', serif;
		font-size: 1.25rem;
		font-weight: bold;
		color: var(--color-neutral, #1f2937);
		margin: 0 0 0.25rem 0;
		line-height: 1.2;
	}

	.student-username {
		font-family: 'Atkinson Hyperlegible', sans-serif;
		font-size: 0.875rem;
		color: var(--color-neutral, #6b7280);
		margin: 0;
		opacity: 0.7;
	}

	@media (max-width: 768px) {
		.student-card {
			padding: 1rem;
		}

		.avatar {
			width: 56px;
			height: 56px;
		}

		.student-name {
			font-size: 1.125rem;
		}

		.student-username {
			font-size: 0.8rem;
		}
	}
</style>
