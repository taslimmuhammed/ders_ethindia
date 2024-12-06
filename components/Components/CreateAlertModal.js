import React, { useContext, useState } from 'react';
import { EthersContext } from '@/context/EthersContext';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, X } from 'lucide-react';

const CreateAlertModal = ({ contractId, contractData, onAlertCreated }) => {
    const { createAlert } = useContext(EthersContext);
    const [open, setOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [formData, setFormData] = useState({
        description: "",
        stake: "",
        isHighPriority: false
    });
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (checked) => {
        setFormData(prev => ({ ...prev, isHighPriority: checked }));
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(prev => [...prev, ...files]);
        e.target.value = '';
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = Array.from(e.dataTransfer.files);
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.description.trim()) {
            newErrors.description = "Description is required";
        }
        if (!formData.stake) {
            newErrors.stake = "Stake amount is required";
        } else if (parseInt(formData.stake) < parseInt(contractData.minStake)) {
            newErrors.stake = `Minimum stake is ${contractData.minStake} wei`;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            await createAlert(
                contractId,
                formData.isHighPriority,
                formData.stake,
                formData.description,
                selectedFiles
            );
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Create Alert</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New Alert</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Describe the issue or vulnerability..."
                            className="min-h-[100px]"
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive">{errors.description}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Upload Files</label>
                        <div
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            className="flex flex-col items-center justify-center w-full px-4 py-6 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                        >
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">Drag and drop files or</p>
                            <label className="mt-2 inline-flex items-center px-3 py-1.5 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90">
                                Browse Files
                                <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                            </label>
                        </div>

                        {selectedFiles.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {selectedFiles.map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-2 bg-muted rounded-md"
                                    >
                                        <span className="text-sm truncate max-w-[200px]">
                                            {file.name}
                                        </span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeFile(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Stake Amount (in wei)</label>
                        <Input
                            name="stake"
                            type="number"
                            value={formData.stake}
                            onChange={handleInputChange}
                            min={parseInt(contractData.minStake)}
                            placeholder="Enter stake amount in wei"
                        />
                        {errors.stake && (
                            <p className="text-sm text-destructive">{errors.stake}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                            Minimum stake required: {parseInt(contractData.minStake)} wei
                        </p>
                    </div>

                    <div className="flex items-start space-x-2">
                        <Checkbox
                            checked={formData.isHighPriority}
                            onCheckedChange={handleCheckboxChange}
                        />
                        <div className="space-y-1 leading-none">
                            <label className="text-sm font-medium">High Priority Alert</label>
                            <p className="text-sm text-muted-foreground">
                                High priority alerts require double the stake but offer double rewards
                            </p>
                        </div>
                    </div>

                    <Button type="submit" className="w-full">
                        Create Alert
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateAlertModal;