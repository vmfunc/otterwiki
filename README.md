# otter.wiki

A simple, modern, and clean website to display a collection of otter pictures.

## Features

*   **Image Gallery:** A responsive grid layout to showcase the otter pictures.
*   **Download:** A download button on each image to save it locally.
*   **Expand:** An expand button to view a larger version of the image in a modal.
*   **Search:** A search bar to filter images by tags.

## Tech Stack

*   **Next.js:** A React framework for building server-rendered applications.
*   **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
*   **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
*   **shadcn/ui:** A collection of re-usable UI components.
*   **Bun:** A fast JavaScript all-in-one toolkit.

## Getting Started

### Prerequisites

*   [Bun](https://bun.sh/)

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/your-username/otter.wiki.git
    ```

2.  Navigate to the project directory:

    ```bash
    cd otter.wiki
    ```

3.  Install the dependencies:

    ```bash
    bun install
    ```

### Running the Development Server

To start the development server, run the following command:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Adding New Images

To add new images to the gallery, simply run the following command in your terminal:

```bash
bun run add-images
```

The script will automatically fetch new images from online sources, download them to `public/otters`, and update the gallery component.
