const DeviceDetailPage = async ({ params }: { params: { postid: string } }) => {
	let json = await fetch(`http://localhost:3000/api/devices/${params.postid}`).then((x) => x.json());

	const { serial_number, product_id, createdAt } = json;

	return (
		<div>
			<h1>Device Details</h1>
			<p>ID: {params.postid}</p>
			<p>Serial Number: {serial_number}</p>
			<p>Product ID: {product_id}</p>
			<p>Created At: {createdAt}</p>
		</div>
	);
};

export default DeviceDetailPage;
