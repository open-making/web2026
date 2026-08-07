<script lang="ts">
	export let studentName = 'Student Name';
	export let galleryUrl = 'student.gallery.com';
	export let commits = 0;
	export let notes = 0;
	export let studentUsername = '';
	export let images = []; // Array of image URLs
	// export let pageType = 'student'; // unused for now

	$: bgColor = '#F8FBF8';
	$: textColor = '#2B2B2B';
	$: accentColor = '#4F4E8D';
	$: primaryColor = '#E8845A';
	$: linkColor = '#4D80E6';
	$: borderColor = '#A3A3A2';
</script>

<div
	style="display: flex; width: 1200px; height: 627px; color: {textColor}; font-family: 'JetBrains Mono', monospace; position: relative; background-color: {bgColor};"
>
	<div
		style="display: flex; flex-direction: column; flex: 1; width: 100%; height: 100%; position: relative; padding: 40px 60px; border: 3px solid {borderColor}; box-shadow: 0 6px 0 0 {borderColor}, 0 8px 24px 0 rgba(0, 0, 0, 0.1); "
	>
		<div
			style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;"
		>
			<div style="display: flex; align-items: center;">
				<span style="color: {primaryColor}; font-size: 20px; margin-right: 8px;">●</span>
				<span
					style="font-size: 16px; font-weight: 600; color: {textColor}; font-family: 'JetBrains Mono', monospace;"
					>WEB2025 STUDENT SHOWCASE</span
				>
			</div>
			<div style="display: flex; align-items: center; gap: 16px;"></div>
		</div>

		<div style="display: flex; flex: 1; gap: 40px;">
			<!-- Left side: Student info -->
			<div style="display: flex; flex-direction: column; flex: 1; justify-content: center;">
				<div style="display: flex; text-align: left; margin-bottom: 16px;">
					<span
						style="font-size: 48px; font-weight: bold; line-height: 1.1; color: {accentColor}; font-family: 'JetBrains Mono', monospace;"
						>{studentName}</span
					>
				</div>
				<div style="display: flex; text-align: left;">
					<span style="font-size: 20px; color: {textColor}; line-height: 1.4; font-weight: 500;"
						>{galleryUrl}</span
					>
				</div>
			</div>
		</div>

		<div
			style="display: flex; justify-content: space-between; align-items: center; border-top: 2px solid {borderColor}; padding-top: 16px; margin-top: 20px;"
		>
			<div style="display: flex; align-items: center; gap: 20px;">
				<div style="display: flex; align-items: center; gap: 8px;">
					<span style="color: {primaryColor}; font-size: 24px; font-weight: bold;">{commits}</span>
					<span style="color: {textColor}; font-size: 16px;">commits</span>
				</div>
				<div style="display: flex; align-items: center; gap: 8px;">
					<span style="color: {primaryColor}; font-size: 24px; font-weight: bold;">{notes}</span>
					<span style="color: {textColor}; font-size: 16px;">dev notes</span>
				</div>
			</div>
			<div style="display: flex;">
				<span
					style="font-size: 18px; font-weight: 600; color: {textColor}; font-family: 'JetBrains Mono', monospace;"
					>web2025-gallery.netlify.app/{studentUsername}</span
				>
			</div>
		</div>
	</div>
</div>
