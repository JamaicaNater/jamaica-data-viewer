<script lang="ts">
  import favicon from '$lib/assets/favicon.svg';
  import "../app.css";
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>Jamaica Data Viewer</title>
</svelte:head>

<!-- Global Navbar -->
<header class="bg-white shadow-md sticky top-0 z-50">
  <nav class="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
    <a href="/" class="text-2xl font-bold text-gray-800 hover:text-blue-600">
      Jamaica Data Viewer
    </a>
    <div class="space-x-4">
      <a href="/elections" class="text-gray-700 hover:text-blue-600 font-medium">
        Elections
      </a>
      <!-- Add more links here if needed -->
    </div>
  </nav>
</header>

<!-- Page content -->
<main class="p-6 max-w-6xl mx-auto">
  <slot />
</main>
